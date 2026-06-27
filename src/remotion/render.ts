import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { logger } from "../logger";
import type { BriefingReelProps } from "./briefing-types";
import type { EventReelProps } from "./event-types";
import {
  BRIEFING_COMPOSITION_ID,
  EVENT_COMPOSITION_ID,
  SUNSET_COMPOSITION_ID,
} from "./Root";
import type { ReelProps } from "./types";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(HERE, "../..");
const ENTRY_POINT = path.join(PROJECT_ROOT, "src/remotion/index.ts");

export interface RenderResult {
  videoPath: string;
  coverPath: string;
}

/** Sunset reel — back-compat name. */
export async function renderReel(
  inputProps: ReelProps,
  outDir: string,
): Promise<RenderResult> {
  return renderComposition({
    compositionId: SUNSET_COMPOSITION_ID,
    inputProps,
    outDir,
    filenameStem: `yvr-sunset-${inputProps.dateISO}`,
  });
}

/** Event reel. */
export async function renderEventReel(
  inputProps: EventReelProps,
  outDir: string,
): Promise<RenderResult> {
  return renderComposition({
    compositionId: EVENT_COMPOSITION_ID,
    inputProps,
    outDir,
    filenameStem: `yvr-event-${inputProps.dateISO}`,
  });
}

/** Weekly briefing reel. */
export async function renderBriefingReel(
  inputProps: BriefingReelProps,
  outDir: string,
  dateISO: string,
): Promise<RenderResult> {
  return renderComposition({
    compositionId: BRIEFING_COMPOSITION_ID,
    inputProps,
    outDir,
    filenameStem: `yvr-briefing-${dateISO}`,
  });
}

interface RenderArgs<P> {
  compositionId: string;
  inputProps: P;
  outDir: string;
  filenameStem: string;
}

async function renderComposition<P extends Record<string, unknown>>(
  args: RenderArgs<P>,
): Promise<RenderResult> {
  logger.info(
    { entry: ENTRY_POINT, composition: args.compositionId },
    "bundling remotion project",
  );
  const serveUrl = await bundle({ entryPoint: ENTRY_POINT });

  const composition = await selectComposition({
    serveUrl,
    id: args.compositionId,
    inputProps: args.inputProps,
  });

  const videoPath = path.join(args.outDir, `${args.filenameStem}.mp4`);
  const coverPath = path.join(args.outDir, `${args.filenameStem}.jpg`);

  logger.info({ videoPath }, "rendering video");
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: videoPath,
    inputProps: args.inputProps,
    audioCodec: "aac",
    enforceAudioTrack: true,
  });

  logger.info({ coverPath }, "rendering cover still");
  await renderStill({
    composition,
    serveUrl,
    output: coverPath,
    inputProps: args.inputProps,
    // Frame 90 = mid-reveal — hero text + photo both visible.
    frame: 90,
    imageFormat: "jpeg",
    jpegQuality: 90,
  });

  return { videoPath, coverPath };
}
