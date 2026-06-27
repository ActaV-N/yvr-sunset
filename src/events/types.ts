export interface CuratedEvent {
  /** Ticketmaster event id (used for cached photo filename). */
  id: string;
  /** Event display name. */
  name: string;
  /** Venue display name. */
  venueName: string;
  /** Local date "YYYY-MM-DD" in Vancouver tz. */
  localDate: string;
  /** Local time "HH:MM" if available (some events are TBA). */
  localTime: string | null;
  /** Best-fit image URL (highest-res 16:9 preferred). null if none. */
  imageUrl: string | null;
  /** Category label, e.g. "Music" / "Arts & Theatre". */
  category: string | null;
  /** Genre label, e.g. "Rock" / "Pop". */
  genre: string | null;
  /** Minimum ticket price + currency, null if no price range. */
  priceFrom: { amount: number; currency: string } | null;
  /** Ticketmaster public URL (caption fallback context). */
  ticketmasterUrl: string | null;
}
