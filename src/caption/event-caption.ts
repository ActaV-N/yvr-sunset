import { config } from "../config";
import type { CuratedEvent } from "../events/types";

const HASHTAGS_EN = [
  "#vancouver",
  "#yvr",
  "#vancouverevents",
  "#vancouverbc",
  "#thingstodo",
];

const HASHTAGS_KO = [
  "#밴쿠버",
  "#밴쿠버이벤트",
  "#밴쿠버여행",
  "#캐나다",
];

/**
 * Build the IG caption for an event reel. Deterministic.
 *
 * Structure (per docs/BRAND.md §5):
 *   [KR headline + date/venue]
 *
 *   [EN headline + date/venue]
 *
 *   via Ticketmaster (Ticketmaster ToS attribution)
 *
 *   [hashtags]
 */
export function buildEventCaption(event: CuratedEvent): string {
  const koHeader = isWeekend(event.localDate)
    ? "이번 주말 밴쿠버"
    : "이번 주 밴쿠버";
  const enHeader = isWeekend(event.localDate)
    ? "This weekend in Vancouver"
    : "This week in Vancouver";

  const ko = [
    `${koHeader}, ${event.name}`,
    `${formatDateKo(event.localDate, event.localTime)} · ${event.venueName}`,
  ].join("\n");

  const en = [
    `${enHeader} — ${event.name}`,
    `${formatDateEn(event.localDate, event.localTime)} · ${event.venueName}`,
  ].join("\n");

  const tags = [...HASHTAGS_EN, ...HASHTAGS_KO].join(" ");

  return `${ko}\n\n${en}\n\nvia Ticketmaster\n\n${tags}`;
}

function isWeekend(localDateISO: string): boolean {
  const d = new Date(`${localDateISO}T12:00:00Z`).getUTCDay();
  return d === 5 || d === 6 || d === 0;
}

const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;
const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function formatDateKo(dateISO: string, time: string | null): string {
  const d = new Date(`${dateISO}T12:00:00Z`);
  const dayKo = DAYS_KO[d.getUTCDay()]!;
  const monthDay = new Intl.DateTimeFormat("ko-KR", {
    timeZone: config.tz,
    month: "long",
    day: "numeric",
  }).format(new Date(`${dateISO}T12:00:00Z`));
  const timePart = time ? ` ${formatTimeKo(time)}` : "";
  return `${monthDay} (${dayKo})${timePart}`;
}

function formatDateEn(dateISO: string, time: string | null): string {
  const d = new Date(`${dateISO}T12:00:00Z`);
  const dayEn = DAYS_EN[d.getUTCDay()]!;
  const monthDay = new Intl.DateTimeFormat("en-US", {
    timeZone: config.tz,
    month: "short",
    day: "numeric",
  }).format(new Date(`${dateISO}T12:00:00Z`));
  const timePart = time ? ` · ${formatTimeEn(time)}` : "";
  return `${dayEn}, ${monthDay}${timePart}`;
}

/** "19:30" → "오후 7시 30분". */
function formatTimeKo(hm: string): string {
  const [hStr, mStr] = hm.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = parseInt(mStr ?? "0", 10);
  const meridiem = h >= 12 ? "오후" : "오전";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${meridiem} ${h12}시` : `${meridiem} ${h12}시 ${m}분`;
}

/** "19:30" → "7:30 PM". */
function formatTimeEn(hm: string): string {
  const [hStr, mStr] = hm.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = parseInt(mStr ?? "0", 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}
