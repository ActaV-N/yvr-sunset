import { exec } from "node:child_process";
import { createHash } from "node:crypto";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Content-addressable cache key. Same (text, voice, model) triple → same hash
 * → same R2 object → no ElevenLabs spend on re-runs across any service.
 */
export function voiceCacheKey(text: string, voiceId: string, modelId: string): string {
  return createHash("sha256")
    .update(`${voiceId}|${modelId}|${text}`)
    .digest("hex")
    .slice(0, 16);
}

/** Build the R2 object key from a cache hash. */
export function voiceR2Key(hash: string): string {
  return `voice/${hash}.mp3`;
}

/** R2 metadata key for storing mp3 duration so cache hits don't re-probe. */
export const DURATION_METADATA_KEY = "duration-seconds";

/** ffprobe-based duration measurement of a local mp3 file. */
export async function measureMp3DurationSeconds(filePath: string): Promise<number> {
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
  );
  return parseFloat(stdout.trim());
}
