import fs from "node:fs";
import path from "node:path";
import { logger } from "../logger";

const AUDIO_DIR = path.resolve("public/audio");

export interface AudioTrack {
  /** Path relative to public/ for Remotion staticFile(). */
  staticPath: string;
  /** Filename without extension, for logs/captions. */
  name: string;
}

/**
 * List all *.mp3 files in public/audio/ sorted by filename.
 * Use a numeric prefix (e.g. "01-…", "02-…") to control rotation order.
 */
function listTracks(): AudioTrack[] {
  if (!fs.existsSync(AUDIO_DIR)) return [];
  return fs
    .readdirSync(AUDIO_DIR)
    .filter((f) => f.toLowerCase().endsWith(".mp3"))
    .sort()
    .map((file) => ({
      staticPath: `audio/${file}`,
      name: file.replace(/\.mp3$/i, ""),
    }));
}

/** Deterministic per-date rotation. Returns null if no tracks present. */
export function pickTrackForDate(dateISO: string): AudioTrack | null {
  const tracks = listTracks();
  if (tracks.length === 0) {
    logger.warn(
      "no audio tracks in public/audio/ — reel will be silent. See docs/BRAND.md §Audio",
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
