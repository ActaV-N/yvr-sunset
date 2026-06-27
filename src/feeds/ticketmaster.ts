import { z } from "zod";
import { config, requireTicketmasterConfig } from "../config";

const DISCOVERY_BASE = "https://app.ticketmaster.com/discovery/v2";

// ── Schema ───────────────────────────────────────────────────────────────
// Strict on the fields we actually use, lenient on the rest.

const ImageSchema = z.object({
  ratio: z.string().optional(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

const VenueSchema = z.object({
  name: z.string(),
  city: z.object({ name: z.string() }).optional(),
  capacity: z.number().optional(), // present on some venues
});

const ClassificationSchema = z.object({
  segment: z.object({ name: z.string() }).optional(),
  genre: z.object({ name: z.string() }).optional(),
  subGenre: z.object({ name: z.string() }).optional(),
});

const PriceRangeSchema = z.object({
  type: z.string().optional(),
  currency: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

const EventSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().optional(),
  images: z.array(ImageSchema).default([]),
  dates: z.object({
    start: z.object({
      localDate: z.string(),
      localTime: z.string().optional(),
      dateTime: z.string().optional(),
    }),
    timezone: z.string().optional(),
  }),
  classifications: z.array(ClassificationSchema).default([]),
  priceRanges: z.array(PriceRangeSchema).default([]).optional(),
  _embedded: z
    .object({ venues: z.array(VenueSchema).default([]) })
    .optional(),
});

export type TicketmasterEvent = z.infer<typeof EventSchema>;

const ResponseSchema = z.object({
  _embedded: z.object({ events: z.array(EventSchema).default([]) }).optional(),
  page: z.object({ totalElements: z.number() }),
});

// ── Client ───────────────────────────────────────────────────────────────

export interface FetchOptions {
  /** Inclusive ISO date string (YYYY-MM-DD). */
  startDate: string;
  /** Exclusive — events strictly before this date. */
  endDate: string;
  /** classificationName filter, e.g. "music,arts". Omit for all. */
  classifications?: string[];
  /** Defaults to Vancouver DMA. */
  dmaId?: number;
  /** Max events to return (Ticketmaster default page size 20, max 200). */
  size?: number;
}

/**
 * Discovery API event search for Vancouver. Returns events sorted by date asc.
 * Empty array is a legal result (low season, no shows that week).
 */
export async function fetchVancouverEvents(
  opts: FetchOptions,
): Promise<TicketmasterEvent[]> {
  requireTicketmasterConfig();

  const url = new URL(`${DISCOVERY_BASE}/events.json`);
  url.searchParams.set("apikey", config.ticketmaster.apiKey);
  url.searchParams.set("dmaId", String(opts.dmaId ?? 222)); // 222 = Vancouver
  url.searchParams.set("startDateTime", `${opts.startDate}T00:00:00Z`);
  url.searchParams.set("endDateTime", `${opts.endDate}T00:00:00Z`);
  url.searchParams.set("sort", "date,asc");
  url.searchParams.set("size", String(opts.size ?? 50));
  if (opts.classifications?.length) {
    url.searchParams.set("classificationName", opts.classifications.join(","));
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `ticketmaster events fetch failed: HTTP ${res.status} — ${await res.text()}`,
    );
  }
  const parsed = ResponseSchema.parse(await res.json());
  return parsed._embedded?.events ?? [];
}
