import fs from "node:fs";
import path from "node:path";
import { logger } from "../logger";

const AUDIO_ROOT = path.resolve("public/audio");

export type AudioMood = "sunset" | "event";

export interface AudioTrack {
  /** Path relative to public/ for Remotion staticFile(). */
  staticPath: string;
  /** Filename without extension, for logs/captions. */
  name: string;
}

/**
 * List *.mp3 in a directory (relative to public/audio), sorted by filename.
 * Use numeric prefix (e.g. "01-…") to control rotation order.
 */
function listTracksIn(relDir: string): AudioTrack[] {
  const abs = path.join(AUDIO_ROOT, relDir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.toLowerCase().endsWith(".mp3"))
    .sort()
    .map((file) => ({
      staticPath: relDir ? `audio/${relDir}/${file}` : `audio/${file}`,
      name: file.replace(/\.mp3$/i, ""),
    }));
}

/**
 * Deterministic per-date rotation, mood-aware.
 *
 * Lookup order:
 *   1. public/audio/{mood}/*.mp3 — preferred, type-specific
 *   2. public/audio/*.mp3        — fallback shared pool
 *
 * Returns null if both are empty (reel renders silent + warning).
 */
export function pickTrackForDate(
  dateISO: string,
  mood: AudioMood = "sunset",
): AudioTrack | null {
  const moodTracks = listTracksIn(mood);
  const tracks = moodTracks.length > 0 ? moodTracks : listTracksIn("");
  if (tracks.length === 0) {
    logger.warn(
      { mood },
      "no audio tracks found — reel will be silent. See docs/BRAND.md §4",
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
