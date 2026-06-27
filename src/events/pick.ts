import { fetchVancouverEvents, type TicketmasterEvent } from "../feeds/ticketmaster";
import { logger } from "../logger";
import type { CuratedEvent } from "./types";

const HORIZON_DAYS = 7;

export class NoEventsAvailableError extends Error {
  constructor() {
    super("no Ticketmaster events match the curation criteria this week");
    this.name = "NoEventsAvailableError";
  }
}

/**
 * Deterministic per-date curation:
 *   1. Fetch upcoming events in horizon (default 7d) for Music + Arts only
 *   2. Require image + venue (no info-thin entries)
 *   3. Prefer weekend (Fri/Sat/Sun); tie-break by venue capacity if known,
 *      then by event id (lexicographic) for stability
 *   4. Throw NoEventsAvailableError if nothing qualifies — caller should
 *      surface as workflow failure (e.g., GH/Railway issue or skip).
 */
export async function pickEventForDate(
  fromDateISO: string,
): Promise<CuratedEvent> {
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
  if (qualified.length === 0) {
    throw new NoEventsAvailableError();
  }

  qualified.sort(compareForPick);
  const winner = qualified[0]!;
  return toCurated(winner);
}

function isQualified(e: TicketmasterEvent): boolean {
  const hasImage = e.images.length > 0;
  const hasVenue = (e._embedded?.venues.length ?? 0) > 0;
  return hasImage && hasVenue;
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
    name: e.name,
    venueName: venue?.name ?? "TBA",
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
