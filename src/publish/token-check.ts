import { z } from "zod";
import { config } from "../config";
import { logger } from "../logger";

const ResponseSchema = z.object({
  data: z.object({
    expires_at: z.number(),
    is_valid: z.boolean().optional(),
  }),
});

const DAY_MS = 86_400_000;
const WARN_DAYS = 14;

/**
 * Best-effort check of the IG access token expiry. Logs a warning if it's
 * within WARN_DAYS of expiry. Never throws — token issues will surface
 * naturally in the publish step.
 */
export async function checkIgTokenExpiry(): Promise<void> {
  if (!config.ig.accessToken) return;

  try {
    const url = new URL(
      `https://graph.facebook.com/${config.ig.graphVersion}/debug_token`,
    );
    url.searchParams.set("input_token", config.ig.accessToken);
    url.searchParams.set("access_token", config.ig.accessToken);

    const res = await fetch(url);
    if (!res.ok) return;
    const parsed = ResponseSchema.parse(await res.json());

    if (parsed.data.expires_at === 0) return; // never expires (uncommon)

    const expiresAt = parsed.data.expires_at * 1000;
    const daysLeft = Math.floor((expiresAt - Date.now()) / DAY_MS);

    if (daysLeft < 0) {
      logger.error({ expiresAt }, "🚨 IG_ACCESS_TOKEN already expired — refresh now");
    } else if (daysLeft < WARN_DAYS) {
      logger.warn(
        { daysLeft, expiresAt },
        `⚠️ IG_ACCESS_TOKEN expires in ${daysLeft} days — refresh manually via Graph Explorer`,
      );
    } else {
      logger.info({ daysLeft }, "ig token healthy");
    }
  } catch (err) {
    logger.debug({ err }, "ig token expiry check failed (non-fatal)");
  }
}
