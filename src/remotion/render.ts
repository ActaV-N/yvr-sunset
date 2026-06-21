import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { logger } from "../logger";
import { COMPOSITION_ID } from "./Root";
import type { ReelProps } from "./types";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(HERE, "../..");
const ENTRY_POINT = path.join(PROJECT_ROOT, "src/remotion/index.ts");

export interface RenderResult {
  videoPath: string;
  coverPath: string;
}

/**
 * Bundle the Remotion project and render the SunsetReel composition.
 * Produces both the H.264 MP4 and a 1080x1920 cover JPEG.
 */
export async function renderReel(
  inputProps: ReelProps,
  outDir: string,
): Promise<RenderResult> {
  logger.info({ entry: ENTRY_POINT }, "bundling remotion project");
  const serveUrl = await bundle({
    entryPoint: ENTRY_POINT,
    // webpackOverride: (c) => c,  // default is fine
  });

  const composition = await selectComposition({
    serveUrl,
    id: COMPOSITION_ID,
    inputProps,
  });

  const videoPath = path.join(outDir, `yvr-sunset-${inputProps.dateISO}.mp4`);
  const coverPath = path.join(outDir, `yvr-sunset-${inputProps.dateISO}.jpg`);

  logger.info({ videoPath }, "rendering video");
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: videoPath,
    inputProps,
    audioCodec: "aac",
    enforceAudioTrack: true,
  });

  logger.info({ coverPath }, "rendering cover still");
  await renderStill({
    composition,
    serveUrl,
    output: coverPath,
    inputProps,
    // Pick a frame in the middle of the TimeCard scene (showing the sunset time).
    frame: 90,
    imageFormat: "jpeg",
    jpegQuality: 90,
  });

  return { videoPath, coverPath };
}
