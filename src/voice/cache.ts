import { createHash } from "node:crypto";
import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export const VOICE_DIR = path.resolve("public/voice");

/**
 * Content-addressable cache key. Same (text, voice, model) triple → same hash
 * → same mp3 file → no API spend on re-runs.
 */
export function voiceCacheKey(text: string, voiceId: string, modelId: string): string {
  return createHash("sha256")
    .update(`${voiceId}|${modelId}|${text}`)
    .digest("hex")
    .slice(0, 16);
}

export function voiceCachePath(hash: string): string {
  return path.join(VOICE_DIR, `${hash}.mp3`);
}

/** "public/voice/{hash}.mp3" — relative path for Remotion staticFile(). */
export function voiceStaticPath(hash: string): string {
  return `voice/${hash}.mp3`;
}

export async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** ffprobe-based duration measurement (system ffprobe — also bundled in Railway nixpacks). */
export async function measureMp3DurationSeconds(filePath: string): Promise<number> {
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
  );
  return parseFloat(stdout.trim());
}
