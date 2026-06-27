import { z } from "zod";

export const EVENT_REEL_FPS = 30;
export const EVENT_REEL_DURATION_SEC = 12;
export const EVENT_REEL_FRAMES = EVENT_REEL_FPS * EVENT_REEL_DURATION_SEC; // 360
export const EVENT_REEL_WIDTH = 1080;
export const EVENT_REEL_HEIGHT = 1920;

export const EventReelPropsSchema = z.object({
  /** Local date "YYYY-MM-DD" — used for file naming, not visual. */
  dateISO: z.string(),
  /** Event display name (English, as-is from Ticketmaster). */
  eventName: z.string(),
  /** Venue display name. */
  venueName: z.string(),
  /** Top-bar date label, e.g. "FRI · JUN 26". */
  dateLabel: z.string(),
  /** Top-bar time label, e.g. "8:00 PM". null → time TBA. */
  timeLabel: z.string().nullable(),
  /** Category, e.g. "MUSIC · ROCK". null if missing. */
  categoryLabel: z.string().nullable(),
  /** Price chip, e.g. "FROM $45 CAD". null → no chip. */
  priceLabel: z.string().nullable(),
  /** Photo source — either a public/ path or full https URL. null → gradient fallback. */
  photoFile: z.string().nullable(),
  /** BGM file under public/, e.g. "audio/02-chill.mp3". null → silent. */
  audioFile: z.string().nullable(),
});

export type EventReelProps = z.infer<typeof EventReelPropsSchema>;

export const DEFAULT_EVENT_REEL_PROPS: EventReelProps = {
  dateISO: "2026-06-27",
  eventName: "Coldplay — Music of the Spheres",
  venueName: "Rogers Arena",
  dateLabel: "SAT · JUN 27",
  timeLabel: "7:30 PM",
  categoryLabel: "MUSIC · ROCK",
  priceLabel: "FROM $45 CAD",
  photoFile: null,
  audioFile: null,
};
