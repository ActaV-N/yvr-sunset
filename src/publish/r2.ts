import fs from "node:fs/promises";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config, requireR2Config } from "../config";
import { logger } from "../logger";

let _client: S3Client | null = null;

function getClient(): S3Client {
  requireR2Config();
  if (_client) return _client;
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2.accessKeyId,
      secretAccessKey: config.r2.secretAccessKey,
    },
  });
  return _client;
}

export interface UploadResult {
  videoUrl: string;
  coverUrl: string;
}

/**
 * Upload the daily reel + cover to R2 and return their public URLs.
 * Keys are date-scoped so re-runs on the same day overwrite (idempotent).
 */
export async function uploadReel(args: {
  videoPath: string;
  coverPath: string;
  dateISO: string;
}): Promise<UploadResult> {
  const client = getClient();
  const videoKey = `reels/${args.dateISO}.mp4`;
  const coverKey = `reels/${args.dateISO}.jpg`;

  await uploadOne(client, args.videoPath, videoKey, "video/mp4");
  await uploadOne(client, args.coverPath, coverKey, "image/jpeg");

  return {
    videoUrl: `${config.r2.publicBaseUrl}/${videoKey}`,
    coverUrl: `${config.r2.publicBaseUrl}/${coverKey}`,
  };
}

async function uploadOne(
  client: S3Client,
  localPath: string,
  key: string,
  contentType: string,
): Promise<void> {
  const body = await fs.readFile(localPath);
  logger.info({ key, bytes: body.length, contentType }, "uploading to R2");
  await client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Immutable: each day has a fixed URL, content within a date is replaced
      // by overwriting the same key. Long cache OK because IG fetches once.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}
