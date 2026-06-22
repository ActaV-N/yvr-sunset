import { config } from "../config";
import type { SunsetLabel } from "../scoring/score";

export interface CaptionInput {
  /** UTC ISO string of sunset moment. Both KR/EN times derived from this. */
  sunsetUtc: string;
  /** English spot name (e.g., "Kitsilano Beach"). */
  spotName: string;
  /** Korean spot name (e.g., "키칠라노 비치"). */
  spotNameKo: string;
  /** 0–100. */
  score: number;
  /** English label from scoring (e.g., "🔥 Great"). */
  label: SunsetLabel;
}

/** Korean mapping for the English label emojis. */
const LABEL_KO: Record<SunsetLabel, string> = {
  "🔥 Great": "🔥 인생 노을",
  "👍 Decent": "👍 괜찮은 노을",
  "😐 Meh": "😐 평범한 노을",
};

/** Stable hashtag set — same every post. Don't randomize: hurts brand search. */
const HASHTAGS_EN = [
  "#vancouver",
  "#yvr",
  "#vancouverbc",
  "#explorebc",
  "#pnw",
  "#vancouversunset",
  "#goldenhour",
];

const HASHTAGS_KO = [
  "#밴쿠버",
  "#밴쿠버일상",
  "#밴쿠버여행",
  "#캐나다",
  "#밴쿠버일몰",
  "#밴쿠버노을",
];

/**
 * Build the IG caption. Deterministic — same input always produces same string.
 * Structure (per docs/BRAND.md §5):
 *   [KR headline]
 *   [KR sub-line with score]
 *
 *   [EN headline]
 *   [EN sub-line with location]
 *
 *   [hashtags]
 */
export function buildCaption(input: CaptionInput): string {
  const timeEn = formatTime(input.sunsetUtc, "en-US");
  const timeKo = formatTimeKo(input.sunsetUtc);
  const labelKo = LABEL_KO[input.label];

  const ko = [
    `오늘 ${timeKo}, ${input.spotNameKo}`,
    `${labelKo} · 점수 ${input.score}`,
  ].join("\n");

  const en = [
    `Tonight's sunset · ${timeEn} at ${input.spotName}`,
    `${input.label} · Vancouver, BC`,
  ].join("\n");

  const tags = [...HASHTAGS_EN, ...HASHTAGS_KO].join(" ");

  return `${ko}\n\n${en}\n\n${tags}`;
}

function formatTime(sunsetUtc: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: config.tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(sunsetUtc));
}

function formatTimeKo(sunsetUtc: string): string {
  // Korean caption reads better as "오후 9시 23분" than "9:23 PM".
  const date = new Date(sunsetUtc);
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: config.tz,
    hour: "numeric",
    hour12: true,
  }).format(date);
  // Parse "9 PM" or "9 AM"
  const [hourPart, ampm] = hourStr.split(" ");
  const hour = parseInt(hourPart ?? "0", 10);
  const minute = new Intl.DateTimeFormat("en-US", {
    timeZone: config.tz,
    minute: "2-digit",
  }).format(date);
  const meridiem = ampm === "PM" ? "오후" : "오전";
  return `${meridiem} ${hour}시 ${minute}분`;
}
