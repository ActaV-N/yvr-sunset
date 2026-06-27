import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "../logger";

const PHOTOS_DIR = path.resolve("public/events");

export interface EventPhoto {
  /** Path relative to public/ for Remotion staticFile(). */
  staticPath: string;
}

/**
 * Download and cache a Ticketmaster event image locally so the Remotion bundle
 * uses `staticFile()` instead of a runtime HTTPS fetch. One-shot per event:
 * delete the file (or the eventId folder) to force a refresh.
 *
 * Cache key is the Ticketmaster event id (unique). Returns null on download
 * failure — caller falls back to the brand DuskGradient.
 */
export async function ensureEventPhoto(
  eventId: string,
  imageUrl: string,
): Promise<EventPhoto | null> {
  const jpgPath = path.join(PHOTOS_DIR, `${eventId}.jpg`);

  if (await fileExists(jpgPath)) {
    return { staticPath: `events/${eventId}.jpg` };
  }

  logger.info({ eventId, imageUrl }, "fetching event photo from Ticketmaster CDN");
  const res = await fetch(imageUrl);
  if (!res.ok || !res.body) {
    logger.warn(
      { eventId, status: res.status },
      "event photo download failed — falling back to gradient",
    );
    return null;
  }

  await fs.mkdir(PHOTOS_DIR, { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(jpgPath, buf);
  logger.info({ eventId, bytes: buf.length }, "cached event photo");

  return { staticPath: `events/${eventId}.jpg` };
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
