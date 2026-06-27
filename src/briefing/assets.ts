import { logger } from "../logger";
import { ensureEventPhoto } from "../photos/ticketmaster";
import { ensureSpotPhoto } from "../photos/unsplash";
import type { BriefingReelProps } from "../remotion/briefing-types";
import { generateVoice } from "../voice/elevenlabs";
import type { BriefingScript } from "./types";

/**
 * Hydrate a BriefingScript into BriefingReelProps:
 *   1. Cache best-sunset spot photo
 *   2. Cache each event photo
 *   3. Generate TTS mp3 per segment (content-hash cache)
 *   4. Convert durations (sec) → frames using fps
 *   5. Project into flat schema expected by the Remotion composition
 */
export async function buildBriefingReelProps(
  script: BriefingScript,
  fps: number,
  bgmFile: string | null,
): Promise<BriefingReelProps> {
  // ── Photos (parallel) ──────────────────────────────────────────────────
  const [sunsetPhotoPath, eventPhotos] = await Promise.all([
    script.context.bestSunset
      ? ensureSpotPhoto(
          script.context.bestSunset.spot.slug,
          script.context.bestSunset.spot.unsplashQuery,
        ).then((p) => p?.staticPath ?? null)
      : Promise.resolve(null),
    Promise.all(
      script.context.topEvents.map(async (e) =>
        e.imageUrl ? (await ensureEventPhoto(e.id, e.imageUrl))?.staticPath ?? null : null,
      ),
    ),
  ]);

  // ── Voice segments (sequential — polite to API) ────────────────────────
  const intro = await voiceSegment(script.segments.intro.voiceText, fps);
  const sunsetWeekV = script.context.bestSunset
    ? await voiceSegment(script.segments.sunsetWeek.voiceText, fps)
    : null;
  const eventVoices: Array<{ url: string; durationFrames: number }> = [];
  for (const seg of script.segments.events) {
    eventVoices.push(await voiceSegment(seg.voiceText, fps));
  }
  const outro = await voiceSegment(script.segments.outro.voiceText, fps);

  // ── Project into composition schema ────────────────────────────────────
  const introScene = {
    voiceFile: intro.url,
    subtitleKR: script.segments.intro.subtitleText,
    durationFrames: intro.durationFrames,
  };
  const sunsetScene =
    script.context.bestSunset && sunsetWeekV
      ? {
          voiceFile: sunsetWeekV.url,
          subtitleKR: script.segments.sunsetWeek.subtitleText,
          durationFrames: sunsetWeekV.durationFrames,
          photoFile: sunsetPhotoPath,
          dateLabelEn: visualDateLabel(script.context.bestSunset.dateISO),
          score: script.context.bestSunset.score,
          spotName: script.context.bestSunset.spot.name,
        }
      : null;
  const eventScenes = script.context.topEvents.map((e, i) => {
    const v = eventVoices[i]!;
    const seg = script.segments.events[i]!;
    return {
      voiceFile: v.url,
      subtitleKR: seg.subtitleText,
      durationFrames: v.durationFrames,
      photoFile: eventPhotos[i] ?? null,
      eventName: e.name,
      venueName: e.venueName,
      dateLabelEn: visualDateLabel(e.localDate),
    };
  });
  const outroScene = {
    voiceFile: outro.url,
    subtitleKR: script.segments.outro.subtitleText,
    durationFrames: outro.durationFrames,
  };

  const totalDurationFrames =
    introScene.durationFrames +
    (sunsetScene?.durationFrames ?? 0) +
    eventScenes.reduce((s, e) => s + e.durationFrames, 0) +
    outroScene.durationFrames;

  logger.info(
    { totalSeconds: totalDurationFrames / fps },
    "briefing total composition length",
  );

  return {
    weekLabel: script.weekLabel,
    totalDurationFrames,
    scenes: {
      intro: introScene,
      sunsetWeek: sunsetScene,
      events: eventScenes,
      outro: outroScene,
    },
    bgmFile,
  };
}

// ─── helpers ─────────────────────────────────────────────────────────────

async function voiceSegment(
  text: string,
  fps: number,
): Promise<{ url: string; durationFrames: number }> {
  const result = await generateVoice(text);
  // Pad 6 frames (0.2s @30fps) — subtitle lingers past final syllable.
  const padFrames = 6;
  const durationFrames = Math.ceil(result.durationSeconds * fps) + padFrames;
  return { url: result.url, durationFrames };
}

const DAYS_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** "WED · JUN 24" — same visual format as EventReel TopBar, uppercased upstream. */
function visualDateLabel(dateISO: string): string {
  const d = new Date(`${dateISO}T12:00:00Z`);
  const idx = d.getUTCDay();
  const day = parseInt(dateISO.slice(8, 10), 10);
  const monthShort = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
  }).format(d);
  return `${DAYS_SHORT_EN[idx]!} · ${monthShort} ${day}`;
}
