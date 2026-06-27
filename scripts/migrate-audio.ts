// One-shot migration: upload existing local public/audio/{mood}/*.mp3 to R2
// under audio/{mood}/. Idempotent — re-running just overwrites with same content.
//
// Usage: npm run migrate:audio

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "../src/logger";
import { putObject } from "../src/storage/r2";

const LOCAL_DIR = path.resolve("public/audio");

async function main(): Promise<void> {
  const entries = await fs.readdir(LOCAL_DIR).catch(() => []);
  let uploaded = 0;

  for (const mood of entries) {
    const moodDir = path.join(LOCAL_DIR, mood);
    const stat = await fs.stat(moodDir).catch(() => null);
    if (!stat?.isDirectory()) continue;

    const files = await fs.readdir(moodDir);
    for (const file of files) {
      if (!file.toLowerCase().endsWith(".mp3")) continue;
      const localPath = path.join(moodDir, file);
      const key = `audio/${mood}/${file}`;
      const buf = await fs.readFile(localPath);
      logger.info({ key, bytes: buf.length }, "uploading to R2");
      await putObject(key, buf, { contentType: "audio/mpeg" });
      uploaded++;
    }
  }

  logger.info({ uploaded }, "✅ audio migration complete");
}

main().catch((err) => {
  logger.error({ err }, "migration failed");
  process.exit(1);
});
