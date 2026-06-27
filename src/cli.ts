import path from "node:path";
import { pickTrackForDate } from "./audio/picker";
import { buildCaption } from "./caption/caption";
import { buildEventCaption } from "./caption/event-caption";
import { config } from "./config";
import { fetchSunsetSnapshot, localDateISO } from "./data/snapshot";
import { pickEventForDate } from "./events/pick";
import { logger } from "./logger";
import { ensureSpotPhoto } from "./photos/unsplash";
import { publishReel } from "./publish/instagram";
import { uploadReel } from "./publish/r2";
import { checkIgTokenExpiry } from "./publish/token-check";
import { renderReel } from "./remotion/render";
import type { ReelProps } from "./remotion/types";
import { computeSunsetScore } from "./scoring/score";
import { pickSpotForDate, type Spot } from "./spots/spots";

type ReelType = "sunset" | "event";
type Command = "run" | "inspect";

interface CliFlags {
  command: Command;
  type: ReelType;
  /** Render only — no upload, no publish. */
  dryRun: boolean;
  /** Skip the IG publish step. Implies render + upload. */
  noPublish: boolean;
}

function parseArgs(argv: string[]): CliFlags {
  const flags: CliFlags = {
    command: "run",
    type: "sunset",
    dryRun: false,
    noPublish: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") flags.dryRun = true;
    else if (a === "--no-publish") flags.noPublish = true;
    else if (a === "inspect") flags.command = "inspect";
    else if (a === "--type") {
      const next = argv[i + 1];
      if (next === "sunset" || next === "event") {
        flags.type = next;
        i++;
      } else {
        throw new Error(`--type must be 'sunset' or 'event' (got ${next})`);
      }
    }
  }
  return flags;
}

// ─── Sunset path ─────────────────────────────────────────────────────────

function formatSunsetDisplay(sunsetUtc: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(sunsetUtc));
}

interface SunsetContext {
  props: ReelProps;
  spot: Spot;
  sunsetUtc: string;
}

async function buildSunsetDaily(): Promise<SunsetContext> {
  const date = localDateISO();
  const snapshot = await fetchSunsetSnapshot(date);
  const score = computeSunsetScore(snapshot.times, snapshot.hourly, config.tz);
  const spot = pickSpotForDate(date);
  const photo = await ensureSpotPhoto(spot.slug, spot.unsplashQuery);
  const track = pickTrackForDate(date);
  const idx = score.hourIndex;

  const props: ReelProps = {
    dateISO: date,
    sunsetDisplay: formatSunsetDisplay(snapshot.times.sunsetUtc, config.tz),
    score: score.score,
    label: score.label,
    spotName: spot.name,
    spotBlurb: spot.blurb,
    clouds: {
      low: snapshot.hourly.cloudCoverLow[idx] ?? 0,
      mid: snapshot.hourly.cloudCoverMid[idx] ?? 0,
      high: snapshot.hourly.cloudCoverHigh[idx] ?? 0,
    },
    visibilityKm: Math.round((snapshot.hourly.visibility[idx] ?? 0) / 1000),
    photoFile: photo?.staticPath ?? null,
    photoCredit: photo?.attribution ? `@${photo.attribution.username}` : null,
    audioFile: track?.staticPath ?? null,
  };

  return { props, spot, sunsetUtc: snapshot.times.sunsetUtc };
}

async function inspectSunset(): Promise<void> {
  const ctx = await buildSunsetDaily();
  logger.info({ props: ctx.props }, "sunset props (inspect)");
  const caption = buildCaption({
    sunsetUtc: ctx.sunsetUtc,
    spotName: ctx.spot.name,
    spotNameKo: ctx.spot.nameKo,
    score: ctx.props.score,
    label: ctx.props.label as "🔥 Great" | "👍 Decent" | "😐 Meh",
  });
  // eslint-disable-next-line no-console
  console.log("\n--- caption preview ---\n" + caption + "\n");
}

async function runSunsetPipeline(flags: CliFlags): Promise<void> {
  if (!flags.dryRun && !flags.noPublish) {
    await checkIgTokenExpiry();
  }
  const ctx = await buildSunsetDaily();
  logger.info({ props: ctx.props }, "sunset props");

  const outDir = path.resolve("out");
  const rendered = await renderReel(ctx.props, outDir);
  logger.info({ ...rendered }, "render complete");

  if (flags.dryRun) {
    logger.info("--dry-run: skipping upload + publish");
    return;
  }

  const uploaded = await uploadReel({
    videoPath: rendered.videoPath,
    coverPath: rendered.coverPath,
    dateISO: ctx.props.dateISO,
  });
  logger.info({ ...uploaded }, "upload complete");

  if (flags.noPublish) {
    logger.info("--no-publish: skipping IG publish");
    return;
  }

  const caption = buildCaption({
    sunsetUtc: ctx.sunsetUtc,
    spotName: ctx.spot.name,
    spotNameKo: ctx.spot.nameKo,
    score: ctx.props.score,
    label: ctx.props.label as "🔥 Great" | "👍 Decent" | "😐 Meh",
  });
  logger.info({ chars: caption.length }, "caption built");

  const published = await publishReel({
    videoUrl: uploaded.videoUrl,
    coverUrl: uploaded.coverUrl,
    caption,
  });
  logger.info({ ...published }, "✅ daily reel published");
}

// ─── Event path ──────────────────────────────────────────────────────────

async function inspectEvent(): Promise<void> {
  const date = localDateISO();
  const event = await pickEventForDate(date);
  logger.info({ event }, "event picked (inspect)");
  const caption = buildEventCaption(event);
  // eslint-disable-next-line no-console
  console.log("\n--- caption preview ---\n" + caption + "\n");
}

async function runEventPipeline(_flags: CliFlags): Promise<void> {
  // Wired incrementally — E2 adds render, E3 adds upload, E4 adds publish.
  throw new Error(
    "event pipeline not yet wired beyond inspect — run with `inspect` for E1, " +
      "or wait for E2 (render) / E3 (upload) / E4 (publish)",
  );
}

// ─── Entry ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2));
  if (flags.command === "inspect") {
    if (flags.type === "event") return inspectEvent();
    return inspectSunset();
  }
  if (flags.type === "event") return runEventPipeline(flags);
  return runSunsetPipeline(flags);
}

main().catch((err) => {
  logger.error({ err }, "cli failed");
  process.exit(1);
});
