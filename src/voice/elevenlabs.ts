import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { config, requireElevenLabsConfig } from "../config";
import { logger } from "../logger";
import { headObject, publicUrl, putObject } from "../storage/r2";
import {
  DURATION_METADATA_KEY,
  measureMp3DurationSeconds,
  voiceCacheKey,
  voiceR2Key,
} from "./cache";

const ENDPOINT = "https://api.elevenlabs.io/v1/text-to-speech";

export interface GenerateVoiceResult {
  /** Full R2 https URL — passed directly to Remotion <Audio src={url} />. */
  url: string;
  durationSeconds: number;
  /** True if served from R2 cache (no API call). */
  cached: boolean;
}

/**
 * Synthesize `text` to mp3 via ElevenLabs, with R2-backed content-hash cache.
 *
 * Cache hit path: HEAD R2 → read `duration-seconds` from object metadata → return URL.
 * Cache miss path: POST ElevenLabs → measure duration via ffprobe → PUT R2 with
 * duration in metadata → return URL.
 *
 * Same (text, voice, model) triple across any run / service / deploy = no API spend.
 */
export async function generateVoice(text: string): Promise<GenerateVoiceResult> {
  requireElevenLabsConfig();
  const { voiceId, modelId, apiKey } = config.elevenlabs;
  const hash = voiceCacheKey(text, voiceId, modelId);
  const key = voiceR2Key(hash);

  // ── R2 cache check ────────────────────────────────────────────────────
  const head = await headObject(key);
  if (head) {
    const stored = parseFloat(head.metadata[DURATION_METADATA_KEY] ?? "");
    if (Number.isFinite(stored) && stored > 0) {
      logger.info({ hash, durationSeconds: stored }, "voice cache hit (R2)");
      return { url: publicUrl(key), durationSeconds: stored, cached: true };
    }
    // Metadata missing — rare orphan; fall through to regenerate.
    logger.warn({ key }, "R2 voice object missing duration metadata — regenerating");
  }

  // ── ElevenLabs call ───────────────────────────────────────────────────
  logger.info({ chars: text.length, voiceId, modelId }, "elevenlabs TTS request");
  const res = await fetch(`${ENDPOINT}/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      output_format: "mp3_44100_128",
    }),
  });
  if (!res.ok) {
    throw new Error(`elevenlabs TTS failed: HTTP ${res.status} — ${await res.text()}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());

  // ── Measure duration (ffprobe needs a path) ──────────────────────────
  const tmpPath = path.join(tmpdir(), `tts-${hash}.mp3`);
  await fs.writeFile(tmpPath, buf);
  const durationSeconds = await measureMp3DurationSeconds(tmpPath);
  await fs.unlink(tmpPath).catch(() => {
    /* ignore — best effort */
  });

  // ── Upload to R2 with duration in object metadata ────────────────────
  await putObject(key, buf, {
    contentType: "audio/mpeg",
    metadata: { [DURATION_METADATA_KEY]: String(durationSeconds) },
  });
  logger.info(
    { hash, bytes: buf.length, durationSeconds },
    "elevenlabs TTS cached to R2",
  );

  return { url: publicUrl(key), durationSeconds, cached: false };
}
