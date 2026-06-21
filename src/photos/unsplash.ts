import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { config } from "../config";
import { logger } from "../logger";

const PHOTOS_DIR = path.resolve("public/spots");

const SearchResponseSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      urls: z.object({ regular: z.string() }),
      user: z.object({
        name: z.string(),
        username: z.string(),
        links: z.object({ html: z.string() }),
      }),
      links: z.object({ html: z.string() }),
    }),
  ),
});

export interface SpotPhoto {
  /** Path relative to public/ for Remotion staticFile() */
  staticPath: string;
  /** Attribution object for caption/overlay; null if photo is local fallback */
  attribution: SpotPhotoAttribution | null;
}

export interface SpotPhotoAttribution {
  photographer: string;
  username: string;
  photographerUrl: string;
  photoUrl: string;
}

/**
 * Ensure a photo exists for the given spot. Returns the cached file if present,
 * otherwise fetches from Unsplash (requires UNSPLASH_ACCESS_KEY).
 *
 * Photos are cached in public/spots/{slug}.jpg + .json (attribution).
 * Caching is one-shot per spot; delete the files to force a refresh.
 */
export async function ensureSpotPhoto(
  slug: string,
  query: string,
): Promise<SpotPhoto | null> {
  const jpgPath = path.join(PHOTOS_DIR, `${slug}.jpg`);
  const jsonPath = path.join(PHOTOS_DIR, `${slug}.json`);

  if (await fileExists(jpgPath)) {
    const attribution = (await fileExists(jsonPath))
      ? (JSON.parse(await fs.readFile(jsonPath, "utf-8")) as SpotPhotoAttribution)
      : null;
    return { staticPath: `spots/${slug}.jpg`, attribution };
  }

  if (!config.unsplash.accessKey) {
    logger.warn(
      { slug },
      "UNSPLASH_ACCESS_KEY not set and no cached photo — falling back to gradient",
    );
    return null;
  }

  logger.info({ slug, query }, "fetching photo from Unsplash");
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "portrait");
  url.searchParams.set("per_page", "1");

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${config.unsplash.accessKey}` },
  });
  if (!res.ok) {
    logger.warn(
      { slug, status: res.status, body: await res.text() },
      "unsplash search failed — falling back to gradient",
    );
    return null;
  }
  const parsed = SearchResponseSchema.parse(await res.json());
  const hit = parsed.results[0];
  if (!hit) {
    logger.warn({ slug, query }, "no unsplash results — falling back to gradient");
    return null;
  }

  await fs.mkdir(PHOTOS_DIR, { recursive: true });
  const imgRes = await fetch(hit.urls.regular);
  if (!imgRes.ok || !imgRes.body) {
    logger.warn({ slug, status: imgRes.status }, "unsplash image download failed");
    return null;
  }
  const buf = Buffer.from(await imgRes.arrayBuffer());
  await fs.writeFile(jpgPath, buf);

  const attribution: SpotPhotoAttribution = {
    photographer: hit.user.name,
    username: hit.user.username,
    photographerUrl: hit.user.links.html,
    photoUrl: hit.links.html,
  };
  await fs.writeFile(jsonPath, JSON.stringify(attribution, null, 2));
  logger.info({ slug, photographer: attribution.photographer }, "cached photo");

  return { staticPath: `spots/${slug}.jpg`, attribution };
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
