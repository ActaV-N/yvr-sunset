import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "../logger";
import { publicUrl, putObject } from "../storage/r2";

export interface UploadResult {
  videoUrl: string;
  coverUrl: string;
}

/**
 * Upload the rendered reel + cover to R2 under `reels/{basename}`.
 *
 * Keys are derived from the local filenames produced by the renderer
 * (`yvr-sunset-{date}.mp4`, `yvr-event-{date}.mp4`, `yvr-briefing-{date}.mp4`).
 * Re-running on the same day with the same content overwrites (idempotent).
 */
export async function uploadReel(args: {
  videoPath: string;
  coverPath: string;
}): Promise<UploadResult> {
  const videoKey = `reels/${path.basename(args.videoPath)}`;
  const coverKey = `reels/${path.basename(args.coverPath)}`;

  await uploadOne(args.videoPath, videoKey, "video/mp4");
  await uploadOne(args.coverPath, coverKey, "image/jpeg");

  return {
    videoUrl: publicUrl(videoKey),
    coverUrl: publicUrl(coverKey),
  };
}

async function uploadOne(
  localPath: string,
  key: string,
  contentType: string,
): Promise<void> {
  const body = await fs.readFile(localPath);
  logger.info({ key, bytes: body.length, contentType }, "uploading to R2");
  await putObject(key, body, { contentType });
}
