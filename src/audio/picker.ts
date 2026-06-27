import { logger } from "../logger";
import { listObjects, publicUrl } from "../storage/r2";

export type AudioMood = "sunset" | "event" | "briefing";

export interface AudioTrack {
  /** Full R2 https URL — passed directly to Remotion <Audio src={url} />. */
  url: string;
  /** Filename without extension, for logs. */
  name: string;
}

/**
 * List BGM mp3s under `audio/{mood}/` in R2. Returns full public URLs sorted by key.
 * Use a numeric prefix (e.g., "01-…") in the filename to control rotation order.
 */
async function listTracksIn(prefix: string): Promise<AudioTrack[]> {
  const keys = await listObjects(prefix);
  return keys
    .filter((k) => k.toLowerCase().endsWith(".mp3"))
    .sort()
    .map((k) => ({
      url: publicUrl(k),
      name: k.replace(/^.*\//, "").replace(/\.mp3$/i, ""),
    }));
}

/**
 * Deterministic per-date rotation, mood-aware.
 *
 * Lookup order:
 *   1. R2 `audio/{mood}/*.mp3`   — preferred, type-specific
 *   2. R2 `audio/sunset/*.mp3`   — universal fallback (always-populated calm pool)
 *   3. R2 `audio/*.mp3`          — flat-root legacy fallback
 *
 * Returns null if all three are empty (reel renders silent + warning).
 */
export async function pickTrackForDate(
  dateISO: string,
  mood: AudioMood = "sunset",
): Promise<AudioTrack | null> {
  let tracks = await listTracksIn(`audio/${mood}/`);
  if (tracks.length === 0 && mood !== "sunset") {
    tracks = await listTracksIn("audio/sunset/");
  }
  if (tracks.length === 0) {
    tracks = await listTracksIn("audio/");
  }
  if (tracks.length === 0) {
    logger.warn(
      { mood },
      "no R2 audio tracks found under audio/* — reel will be silent",
    );
    return null;
  }

  let hash = 0;
  for (let i = 0; i < dateISO.length; i++) {
    hash = (hash * 31 + dateISO.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % tracks.length;
  return tracks[idx]!;
}
