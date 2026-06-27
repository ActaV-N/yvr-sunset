import { fetchVancouverEvents, type TicketmasterEvent } from "../feeds/ticketmaster";
import { logger } from "../logger";
import { isBlockedByKeyword } from "./policy";
import type { CuratedEvent } from "./types";

const HORIZON_DAYS = 7;

export class NoEventsAvailableError extends Error {
  constructor() {
    super("no Ticketmaster events match the curation criteria this week");
    this.name = "NoEventsAvailableError";
  }
}

/**
 * Deterministic per-date curation. Returns up to `n` events in priority order
 * (weekend first → venue capacity → id stable). Returns empty array if nothing
 * qualifies — caller decides whether to throw.
 *
 *   1. Fetch upcoming events in horizon (default 7d) for Music + Arts only
 *   2. Require image + venue (no info-thin entries)
 *   3. Apply BLOCKED_KEYWORDS policy filter
 *   4. Sort by weekend/capacity/id
 */
export async function pickTopEvents(
  fromDateISO: string,
  n = 1,
): Promise<CuratedEvent[]> {
  const start = new Date(`${fromDateISO}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + HORIZON_DAYS);
  const endDateISO = end.toISOString().slice(0, 10);

  const raw = await fetchVancouverEvents({
    startDate: fromDateISO,
    endDate: endDateISO,
    classifications: ["music", "arts"],
    size: 100,
  });

  logger.info({ rawCount: raw.length }, "ticketmaster events fetched");

  const qualified = raw.filter(isQualified);
  logger.info(
    { qualifiedCount: qualified.length, blockedCount: raw.length - qualified.length },
    "events filtered by qualification + keyword policy",
  );

  qualified.sort(compareForPick);
  // Collapse multi-night runs of the same act at the same venue (touring
  // shows often book early/late or back-to-back nights → looks duplicated
  // in a briefing). Keeps the highest-priority instance per (name, venue).
  const distinct = dedupByNameVenue(qualified);
  return distinct.slice(0, n).map(toCurated);
}

function dedupByNameVenue(events: TicketmasterEvent[]): TicketmasterEvent[] {
  const seen = new Set<string>();
  const out: TicketmasterEvent[] = [];
  for (const e of events) {
    const venue = e._embedded?.venues[0]?.name ?? "";
    const key = `${e.name}|${venue}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

/** Single-event pick — throws if nothing qualifies. Thin wrapper over pickTopEvents. */
export async function pickEventForDate(fromDateISO: string): Promise<CuratedEvent> {
  const picks = await pickTopEvents(fromDateISO, 1);
  if (picks.length === 0) throw new NoEventsAvailableError();
  return picks[0]!;
}

function isQualified(e: TicketmasterEvent): boolean {
  const hasImage = e.images.length > 0;
  const hasVenue = (e._embedded?.venues.length ?? 0) > 0;
  if (!hasImage || !hasVenue) return false;

  // Brand-policy keyword filter — name + classification labels.
  const classificationText = e.classifications
    .flatMap((c) => [c.segment?.name, c.genre?.name, c.subGenre?.name])
    .filter(Boolean)
    .join(" ");
  const haystack = `${e.name} ${classificationText}`;
  return !isBlockedByKeyword(haystack);
}

/** Sort comparator: weekend events first, then larger venue, then stable id. */
function compareForPick(a: TicketmasterEvent, b: TicketmasterEvent): number {
  const aWeekend = isWeekend(a.dates.start.localDate) ? 0 : 1;
  const bWeekend = isWeekend(b.dates.start.localDate) ? 0 : 1;
  if (aWeekend !== bWeekend) return aWeekend - bWeekend;

  const aCap = a._embedded?.venues[0]?.capacity ?? 0;
  const bCap = b._embedded?.venues[0]?.capacity ?? 0;
  if (aCap !== bCap) return bCap - aCap;

  return a.id.localeCompare(b.id);
}

function isWeekend(localDateISO: string): boolean {
  // localDateISO is "YYYY-MM-DD" assumed Vancouver local — Date.UTC parsing is fine
  // for the day-of-week purpose since the date string has no time.
  const d = new Date(`${localDateISO}T12:00:00Z`).getUTCDay();
  return d === 5 || d === 6 || d === 0; // Fri, Sat, Sun
}

/** Pick the best image: highest-res with 16:9 ratio preferred. */
function pickImage(e: TicketmasterEvent): string | null {
  const sorted = [...e.images].sort((a, b) => {
    const aSixteen = a.ratio === "16_9" ? 0 : 1;
    const bSixteen = b.ratio === "16_9" ? 0 : 1;
    if (aSixteen !== bSixteen) return aSixteen - bSixteen;
    return b.width * b.height - a.width * a.height;
  });
  return sorted[0]?.url ?? null;
}

function toCurated(e: TicketmasterEvent): CuratedEvent {
  const venue = e._embedded?.venues[0];
  const cls = e.classifications[0];
  const price = e.priceRanges?.[0];

  return {
    id: e.id,
    name: e.name.trim(),
    venueName: venue?.name?.trim() ?? "TBA",
    localDate: e.dates.start.localDate,
    localTime: e.dates.start.localTime?.slice(0, 5) ?? null,
    imageUrl: pickImage(e),
    category: cls?.segment?.name ?? null,
    genre: cls?.genre?.name ?? null,
    priceFrom:
      price?.min != null && price.currency != null
        ? { amount: price.min, currency: price.currency }
        : null,
    ticketmasterUrl: e.url ?? null,
  };
}
