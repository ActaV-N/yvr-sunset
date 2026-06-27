import fs from "node:fs/promises";
import { config, requireElevenLabsConfig } from "../config";
import { logger } from "../logger";
import {
  fileExists,
  measureMp3DurationSeconds,
  voiceCacheKey,
  voiceCachePath,
  voiceStaticPath,
  VOICE_DIR,
} from "./cache";

const ENDPOINT = "https://api.elevenlabs.io/v1/text-to-speech";

export interface GenerateVoiceResult {
  /** Path under public/ for Remotion staticFile(), e.g., "voice/abc123.mp3". */
  staticPath: string;
  /** Local absolute path (debug). */
  absolutePath: string;
  /** Measured mp3 duration in seconds. */
  durationSeconds: number;
  /** True if served from cache (no API call). */
  cached: boolean;
}

/**
 * Synthesize `text` to mp3 via ElevenLabs, with content-hash cache.
 * Same (text, voice, model) triple → same hash → no API spend on re-run.
 */
export async function generateVoice(text: string): Promise<GenerateVoiceResult> {
  requireElevenLabsConfig();
  const { voiceId, modelId, apiKey } = config.elevenlabs;
  const hash = voiceCacheKey(text, voiceId, modelId);
  const abs = voiceCachePath(hash);

  if (await fileExists(abs)) {
    const durationSeconds = await measureMp3DurationSeconds(abs);
    return {
      staticPath: voiceStaticPath(hash),
      absolutePath: abs,
      durationSeconds,
      cached: true,
    };
  }

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

  await fs.mkdir(VOICE_DIR, { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(abs, buf);
  const durationSeconds = await measureMp3DurationSeconds(abs);
  logger.info(
    { hash, bytes: buf.length, durationSeconds },
    "elevenlabs TTS cached",
  );

  return {
    staticPath: voiceStaticPath(hash),
    absolutePath: abs,
    durationSeconds,
    cached: false,
  };
}
