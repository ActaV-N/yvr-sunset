import { config } from "../config";
import { fetchSunsetSnapshot } from "../data/snapshot";
import { pickTopEvents } from "../events/pick";
import type { CuratedEvent } from "../events/types";
import { logger } from "../logger";
import { computeSunsetScore } from "../scoring/score";
import { pickSpotForDate } from "../spots/spots";
import type { VoiceSegment } from "../voice/types";
import type { BestSunsetOfWeek, BriefingScript } from "./types";

const PAST_WEEK_DAYS = 7;
const EVENT_PICKS = 3;

const DAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const DAYS_KO = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"] as const;
const DAYS_KO_SHORT = ["일", "월", "화", "수", "목", "금", "토"] as const;

/**
 * Build a deterministic briefing script for the given publish date (default: now).
 *
 * Doesn't call TTS or download photos — those happen in B2 (render path).
 * Inspect path uses this output as-is to verify data + script before any spend.
 */
export async function buildBriefingScript(
  publishDate: Date = new Date(),
): Promise<BriefingScript> {
  const today = localDateISO(publishDate);

  // ── Past week sunsets ───────────────────────────────────────────────────
  // Sequential — open-meteo free tier 429s on burst parallel. 7×2 calls ≈ 3-5s.
  const pastDates = pastDateRange(publishDate, PAST_WEEK_DAYS);
  const sunsetScores: { date: string; score: number }[] = [];
  for (const date of pastDates) {
    try {
      const snap = await fetchSunsetSnapshot(date);
      const result = computeSunsetScore(snap.times, snap.hourly, config.tz);
      sunsetScores.push({ date, score: result.score });
    } catch (err) {
      logger.warn({ date, err }, "sunset snapshot failed for day — skipping");
      sunsetScores.push({ date, score: -1 });
    }
  }
  const best = sunsetScores
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score)[0];

  let bestSunset: BestSunsetOfWeek | null = null;
  if (best) {
    const spot = pickSpotForDate(best.date);
    const { en, ko } = dayLabels(best.date);
    bestSunset = {
      dateISO: best.date,
      dayLabelEn: en,
      dayLabelKo: ko,
      score: best.score,
      spot,
      // Photo cached in B2 render step (ensureSpotPhoto is idempotent).
      photoFile: null,
    };
  }

  // ── Next week events ────────────────────────────────────────────────────
  const topEvents = await pickTopEvents(today, EVENT_PICKS);
  logger.info({ pickedCount: topEvents.length }, "briefing top events picked");

  // ── Segments ────────────────────────────────────────────────────────────
  const segments = {
    intro: makeIntro(),
    sunsetWeek: makeSunsetWeek(bestSunset),
    events: topEvents.map(makeEvent),
    outro: makeOutro(),
  };

  return {
    dateISO: today,
    weekLabel: makeWeekLabel(publishDate),
    segments,
    context: { bestSunset, topEvents },
  };
}

// ─── Date helpers ────────────────────────────────────────────────────────

function localDateISO(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: config.tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function pastDateRange(from: Date, days: number): string[] {
  const out: string[] = [];
  for (let i = 1; i <= days; i++) {
    const d = new Date(from);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(localDateISO(d));
  }
  return out;
}

function dayLabels(dateISO: string): { en: string; ko: string } {
  const idx = new Date(`${dateISO}T12:00:00Z`).getUTCDay();
  return { en: DAYS_EN[idx]!, ko: DAYS_KO[idx]! };
}

/** Disambiguating date labels for events that may share a weekday. */
function dateLabels(dateISO: string): {
  /** On-screen eyebrow, e.g., "SUN · JUN 28" (caller uppercases). */
  visualEn: string;
  /** KR subtitle date prefix, e.g., "6월 28일 (일)". */
  ko: string;
  /** Voice-friendly fragment for EN TTS, e.g., "Sunday the 28th". */
  voiceEn: string;
} {
  const d = new Date(`${dateISO}T12:00:00Z`);
  const idx = d.getUTCDay();
  const day = parseInt(dateISO.slice(8, 10), 10);
  const month = parseInt(dateISO.slice(5, 7), 10);
  const monthShort = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
  }).format(d);
  return {
    visualEn: `${shortDayEn(idx)} · ${monthShort} ${day}`,
    ko: `${month}월 ${day}일 (${DAYS_KO_SHORT[idx]!})`,
    voiceEn: `${DAYS_EN[idx]!} the ${ordinal(day)}`,
  };
}

function shortDayEn(idx: number): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][idx]!;
}

function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function makeWeekLabel(publishDate: Date): string {
  // Publish is Sunday evening → upcoming Monday starts the covered week.
  const nextMon = new Date(publishDate);
  nextMon.setUTCDate(nextMon.getUTCDate() + 1);
  const monthDay = new Intl.DateTimeFormat("en-US", {
    timeZone: config.tz,
    month: "short",
    day: "numeric",
  }).format(nextMon);
  return `Week of ${monthDay}`;
}

// ─── Segment builders ────────────────────────────────────────────────────

function emptySegment(): Pick<VoiceSegment, "audioFile" | "durationFrames"> {
  return { audioFile: null, durationFrames: 0 };
}

function makeIntro(): VoiceSegment {
  return {
    voiceText: "This week in Vancouver.",
    subtitleText: "이번 주 밴쿠버",
    ...emptySegment(),
  };
}

function makeSunsetWeek(best: BestSunsetOfWeek | null): VoiceSegment {
  if (!best) {
    return {
      voiceText: "A cloudy week for sunsets. Clearer skies ahead.",
      subtitleText: "흐린 한 주, 다가올 주는 맑길.",
      ...emptySegment(),
    };
  }
  const dl = dateLabels(best.dateISO);
  return {
    voiceText: `${best.dayLabelEn}'s sunset scored ${best.score} — the week's best at ${best.spot.name}.`,
    subtitleText: `${dl.ko}, ${best.score}점 — ${best.spot.nameKo}.`,
    ...emptySegment(),
  };
}

function makeEvent(e: CuratedEvent): VoiceSegment {
  const dl = dateLabels(e.localDate);
  return {
    voiceText: `${e.name}, at ${e.venueName}, ${dl.voiceEn}.`,
    subtitleText: `${dl.ko} · ${e.name} · ${e.venueName}`,
    ...emptySegment(),
  };
}

function makeOutro(): VoiceSegment {
  return {
    voiceText: "Follow at kokio dot yvr for the daily Vancouver.",
    subtitleText: "매일의 밴쿠버, @kokio.yvr 팔로우.",
    ...emptySegment(),
  };
}
