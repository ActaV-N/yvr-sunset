import type { BriefingScript } from "../briefing/types";

const HASHTAGS_EN = [
  "#vancouver",
  "#yvr",
  "#vancouverbc",
  "#thisweekvancouver",
  "#vancouverweekly",
];

const HASHTAGS_KO = [
  "#밴쿠버",
  "#밴쿠버주간",
  "#밴쿠버다이제스트",
  "#밴쿠버일상",
  "#캐나다",
];

const DAYS_KO_LONG = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
] as const;
const DAYS_EN_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * Build the IG caption for a weekly briefing reel. Deterministic — same script
 * always produces same caption string.
 *
 * Structure (per docs/BRAND.md §7):
 *   [KR header]
 *   [KR digest line — sunset + event count]
 *
 *   [EN header]
 *   [EN digest line]
 *
 *   via Ticketmaster + Open-Meteo · Voice by ElevenLabs
 *
 *   [hashtags]
 */
export function buildBriefingCaption(script: BriefingScript): string {
  const ko = buildKr(script);
  const en = buildEn(script);
  const attribution = "via Ticketmaster + Open-Meteo · Voice by ElevenLabs";
  const tags = [...HASHTAGS_EN, ...HASHTAGS_KO].join(" ");
  return `${ko}\n\n${en}\n\n${attribution}\n\n${tags}`;
}

function buildKr(script: BriefingScript): string {
  const lines: string[] = ["이번 주 밴쿠버 다이제스트"];
  const sunsetLine = sunsetLineKr(script);
  const eventLine = eventLineKr(script);
  lines.push([sunsetLine, eventLine].filter(Boolean).join(" · "));
  return lines.join("\n");
}

function buildEn(script: BriefingScript): string {
  const lines: string[] = ["This week in Vancouver — weekly briefing"];
  const sunsetLine = sunsetLineEn(script);
  const eventLine = eventLineEn(script);
  lines.push([sunsetLine, eventLine].filter(Boolean).join(" · "));
  return lines.join("\n");
}

function sunsetLineKr(script: BriefingScript): string {
  const best = script.context.bestSunset;
  if (!best) return "지난 주 흐림";
  const day = DAYS_KO_LONG[dayIdx(best.dateISO)]!;
  return `${day} ${best.score}점`;
}

function sunsetLineEn(script: BriefingScript): string {
  const best = script.context.bestSunset;
  if (!best) return "Cloudy week";
  const day = DAYS_EN_LONG[dayIdx(best.dateISO)]!;
  return `Sunset highlight ${day} ${best.score}`;
}

function eventLineKr(script: BriefingScript): string {
  const n = script.context.topEvents.length;
  if (n === 0) return "";
  return `이번 주말 이벤트 ${n}건`;
}

function eventLineEn(script: BriefingScript): string {
  const n = script.context.topEvents.length;
  if (n === 0) return "";
  return `${n} weekend picks`;
}

function dayIdx(dateISO: string): number {
  return new Date(`${dateISO}T12:00:00Z`).getUTCDay();
}
