import path from "node:path";
import { pickTrackForDate } from "./audio/picker";
import { config } from "./config";
import { fetchSunsetSnapshot, localDateISO } from "./data/snapshot";
import { logger } from "./logger";
import { ensureSpotPhoto } from "./photos/unsplash";
import { uploadReel } from "./publish/r2";
import { renderReel } from "./remotion/render";
import type { ReelProps } from "./remotion/types";
import { computeSunsetScore } from "./scoring/score";
import { pickSpotForDate } from "./spots/spots";

type Command = "run" | "inspect";

interface CliFlags {
  command: Command;
  /** Render only — no upload, no publish. */
  dryRun: boolean;
  /** Skip the IG publish step (Phase 4). Implies render + upload. */
  noPublish: boolean;
}

function parseArgs(argv: string[]): CliFlags {
  const flags: CliFlags = { command: "run", dryRun: false, noPublish: false };
  for (const a of argv) {
    if (a === "--dry-run") flags.dryRun = true;
    else if (a === "--no-publish") flags.noPublish = true;
    else if (a === "inspect") flags.command = "inspect";
  }
  return flags;
}

function formatSunsetDisplay(sunsetUtc: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(sunsetUtc));
}

async function buildReelProps(): Promise<ReelProps> {
  const date = localDateISO();
  const snapshot = await fetchSunsetSnapshot(date);
  const score = computeSunsetScore(snapshot.times, snapshot.hourly, config.tz);
  const spot = pickSpotForDate(date);
  const photo = await ensureSpotPhoto(spot.slug, spot.unsplashQuery);
  const track = pickTrackForDate(date);
  const idx = score.hourIndex;

  return {
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
}

async function inspect(): Promise<void> {
  const props = await buildReelProps();
  logger.info({ props }, "reel props (inspect)");
}

async function runPipeline(flags: CliFlags): Promise<void> {
  const props = await buildReelProps();
  logger.info({ props }, "reel props");

  const outDir = path.resolve("out");
  const rendered = await renderReel(props, outDir);
  logger.info({ ...rendered }, "render complete");

  if (flags.dryRun) {
    logger.info("--dry-run: skipping upload + publish");
    return;
  }

  const uploaded = await uploadReel({
    videoPath: rendered.videoPath,
    coverPath: rendered.coverPath,
    dateISO: props.dateISO,
  });
  logger.info({ ...uploaded }, "upload complete");

  if (flags.noPublish) {
    logger.info("--no-publish: skipping IG publish");
    return;
  }

  // Phase 4 wires IG publish here.
  logger.warn("IG publish not yet wired — re-run with --no-publish to stop here cleanly");
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2));
  if (flags.command === "inspect") {
    await inspect();
    return;
  }
  await runPipeline(flags);
}

main().catch((err) => {
  logger.error({ err }, "cli failed");
  process.exit(1);
});
