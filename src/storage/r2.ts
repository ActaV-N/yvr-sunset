import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { config, requireR2Config } from "../config";

let _client: S3Client | null = null;

export function getR2Client(): S3Client {
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

/** Public HTTPS URL for an object key. */
export function publicUrl(key: string): string {
  return `${config.r2.publicBaseUrl}/${key}`;
}

export interface HeadResult {
  contentLength: number;
  contentType?: string;
  /** Custom user metadata. Keys are lowercased by S3/R2. */
  metadata: Record<string, string>;
}

/** HEAD object — returns null if 404. */
export async function headObject(key: string): Promise<HeadResult | null> {
  try {
    const res = await getR2Client().send(
      new HeadObjectCommand({ Bucket: config.r2.bucket, Key: key }),
    );
    return {
      contentLength: res.ContentLength ?? 0,
      contentType: res.ContentType,
      metadata: res.Metadata ?? {},
    };
  } catch (err: unknown) {
    const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (e.name === "NotFound" || e.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw err;
  }
}

export interface PutOptions {
  contentType: string;
  /** Custom user metadata stored alongside the object. */
  metadata?: Record<string, string>;
  cacheControl?: string;
}

export async function putObject(
  key: string,
  body: Buffer,
  opts: PutOptions,
): Promise<void> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
      Body: body,
      ContentType: opts.contentType,
      Metadata: opts.metadata,
      CacheControl: opts.cacheControl ?? "public, max-age=31536000, immutable",
    }),
  );
}

/** Download object body as Buffer. Used by migration scripts; renders fetch over HTTPS instead. */
export async function getObject(key: string): Promise<Buffer> {
  const res = await getR2Client().send(
    new GetObjectCommand({ Bucket: config.r2.bucket, Key: key }),
  );
  if (!res.Body) throw new Error(`R2 object ${key} has no body`);
  return Buffer.from(await res.Body.transformToByteArray());
}

/** List object keys under a prefix. */
export async function listObjects(prefix: string): Promise<string[]> {
  const res = await getR2Client().send(
    new ListObjectsV2Command({ Bucket: config.r2.bucket, Prefix: prefix }),
  );
  return (res.Contents ?? [])
    .map((o) => o.Key)
    .filter((k): k is string => typeof k === "string");
}
