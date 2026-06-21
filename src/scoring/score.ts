import type { HourlyWeather, SunsetTimes } from "../data/types";

export type SunsetLabel = "🔥 Great" | "👍 Decent" | "😐 Meh";

export interface SunsetScore {
  /** 0–100 */
  score: number;
  label: SunsetLabel;
  /** Hour index used for scoring (matches HourlyWeather arrays) */
  hourIndex: number;
  /** Breakdown for debugging / display */
  breakdown: {
    midHigh: number;
    low: number;
    visibility: number;
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Pick the index in `hourly.time` closest to the given UTC instant.
 * Note: hourly.time strings are local tz (no offset). We treat them as Date.parse-compatible
 * by appending the assumed local hour to a Date built in that tz — simpler: compare by
 * UTC epoch built from the local string with a Vancouver offset lookup is overkill here.
 * We just compare hour-of-day match against the sunset hour in the same tz.
 */
function pickHourIndex(sunsetUtcISO: string, hourly: HourlyWeather, tz: string): number {
  const sunsetDate = new Date(sunsetUtcISO);
  // Hour of day in target tz (0..23)
  const hourStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    hour12: false,
  }).format(sunsetDate);
  const sunsetHour = parseInt(hourStr, 10);
  let bestIdx = 0;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (let i = 0; i < hourly.time.length; i++) {
    const t = hourly.time[i];
    if (!t) continue;
    // "YYYY-MM-DDTHH:MM" — parse hour
    const h = parseInt(t.slice(11, 13), 10);
    const diff = Math.abs(h - sunsetHour);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Heuristic 0..100 score. Higher = better sunset.
 *  - Mid+high cloud cover near the 30–70% band (peaks at 50%) → up to 50pt
 *  - Low cloud cover < 30% → up to 30pt (linearly decays to 0 at 80%)
 *  - Visibility ≥ 20km → 20pt, decays to 0 at 5km
 */
export function computeSunsetScore(
  times: SunsetTimes,
  hourly: HourlyWeather,
  tz: string,
): SunsetScore {
  const idx = pickHourIndex(times.sunsetUtc, hourly, tz);
  const low = hourly.cloudCoverLow[idx] ?? 0;
  const mid = hourly.cloudCoverMid[idx] ?? 0;
  const high = hourly.cloudCoverHigh[idx] ?? 0;
  const visibilityM = hourly.visibility[idx] ?? 0;

  const midHighSum = mid + high;
  // Triangular peak at 50, zero at 0 and 100, max 50pt.
  const midHighPt = clamp(50 - Math.abs(midHighSum - 50), 0, 50);

  // Low clouds: 30pt at ≤30%, linear down to 0 at ≥80%.
  const lowPt = low <= 30 ? 30 : low >= 80 ? 0 : (30 * (80 - low)) / 50;

  // Visibility: 20pt at ≥20km, 0 at ≤5km, linear in between.
  const visKm = visibilityM / 1000;
  const visPt = visKm >= 20 ? 20 : visKm <= 5 ? 0 : (20 * (visKm - 5)) / 15;

  const total = Math.round(midHighPt + lowPt + visPt);
  const score = clamp(total, 0, 100);

  const label: SunsetLabel = score >= 75 ? "🔥 Great" : score >= 50 ? "👍 Decent" : "😐 Meh";

  return {
    score,
    label,
    hourIndex: idx,
    breakdown: {
      midHigh: Math.round(midHighPt),
      low: Math.round(lowPt),
      visibility: Math.round(visPt),
    },
  };
}
