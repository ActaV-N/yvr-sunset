import { z } from "zod";
import { config, requireIgConfig } from "../config";
import { logger } from "../logger";

const GRAPH_BASE = "https://graph.facebook.com";

const ContainerCreateSchema = z.object({ id: z.string() });
const ContainerStatusSchema = z.object({
  status_code: z.enum(["IN_PROGRESS", "FINISHED", "ERROR", "EXPIRED", "PUBLISHED"]),
  status: z.string().optional(),
});
const PublishSchema = z.object({ id: z.string() });
const PermalinkSchema = z.object({ permalink: z.string() });

/** Exponential backoff schedule for container readiness polling, in seconds. */
const POLL_DELAYS_SEC = [5, 10, 20, 30, 60, 60, 60, 60];

export interface PublishInput {
  /** Publicly fetchable mp4 URL (R2 in our case). */
  videoUrl: string;
  /** Publicly fetchable cover image URL (optional but helps the feed thumbnail). */
  coverUrl: string;
  /** Full caption (KR + EN + hashtags). */
  caption: string;
}

export interface PublishResult {
  /** Media ID of the published reel. */
  mediaId: string;
  /** Public IG permalink (e.g., https://www.instagram.com/reel/...). */
  permalink: string;
}

/**
 * Publish a reel via the 3-step container model:
 *   1. Create media container with REELS type
 *   2. Poll container until status_code === FINISHED
 *   3. Publish container → returns media ID
 *   4. Fetch permalink for logging
 */
export async function publishReel(input: PublishInput): Promise<PublishResult> {
  requireIgConfig();
  const containerId = await createContainer(input);
  logger.info({ containerId }, "ig container created");

  await waitForContainerReady(containerId);

  const mediaId = await publishContainer(containerId);
  logger.info({ mediaId }, "ig media published");

  const permalink = await fetchPermalink(mediaId);
  logger.info({ permalink }, "ig permalink");

  return { mediaId, permalink };
}

async function createContainer(input: PublishInput): Promise<string> {
  const url = new URL(`${GRAPH_BASE}/${config.ig.graphVersion}/${config.ig.userId}/media`);
  url.searchParams.set("media_type", "REELS");
  url.searchParams.set("video_url", input.videoUrl);
  url.searchParams.set("caption", input.caption);
  url.searchParams.set("share_to_feed", "true");
  url.searchParams.set("cover_url", input.coverUrl);
  url.searchParams.set("access_token", config.ig.accessToken);

  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    throw new Error(`ig container create failed: HTTP ${res.status} — ${await res.text()}`);
  }
  return ContainerCreateSchema.parse(await res.json()).id;
}

async function waitForContainerReady(containerId: string): Promise<void> {
  for (let i = 0; i < POLL_DELAYS_SEC.length; i++) {
    const delaySec = POLL_DELAYS_SEC[i]!;
    await sleep(delaySec * 1000);

    const status = await fetchContainerStatus(containerId);
    logger.info(
      { containerId, attempt: i + 1, status: status.status_code },
      "ig container status",
    );

    if (status.status_code === "FINISHED") return;
    if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
      throw new Error(
        `ig container ${containerId} ${status.status_code}: ${status.status ?? "no details"}`,
      );
    }
  }
  throw new Error(
    `ig container ${containerId} not ready after ${POLL_DELAYS_SEC.length} attempts`,
  );
}

async function fetchContainerStatus(
  containerId: string,
): Promise<z.infer<typeof ContainerStatusSchema>> {
  const url = new URL(`${GRAPH_BASE}/${config.ig.graphVersion}/${containerId}`);
  url.searchParams.set("fields", "status_code,status");
  url.searchParams.set("access_token", config.ig.accessToken);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`ig container status failed: HTTP ${res.status} — ${await res.text()}`);
  }
  return ContainerStatusSchema.parse(await res.json());
}

async function publishContainer(containerId: string): Promise<string> {
  const url = new URL(
    `${GRAPH_BASE}/${config.ig.graphVersion}/${config.ig.userId}/media_publish`,
  );
  url.searchParams.set("creation_id", containerId);
  url.searchParams.set("access_token", config.ig.accessToken);

  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    throw new Error(`ig publish failed: HTTP ${res.status} — ${await res.text()}`);
  }
  return PublishSchema.parse(await res.json()).id;
}

async function fetchPermalink(mediaId: string): Promise<string> {
  const url = new URL(`${GRAPH_BASE}/${config.ig.graphVersion}/${mediaId}`);
  url.searchParams.set("fields", "permalink");
  url.searchParams.set("access_token", config.ig.accessToken);
  const res = await fetch(url);
  if (!res.ok) {
    // Non-fatal: publish succeeded, we just couldn't fetch the link.
    logger.warn(
      { mediaId, status: res.status },
      "ig permalink fetch failed (publish still OK)",
    );
    return "(permalink unavailable)";
  }
  return PermalinkSchema.parse(await res.json()).permalink;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
