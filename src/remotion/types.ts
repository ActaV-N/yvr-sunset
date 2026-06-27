import { z } from "zod";

export const REEL_FPS = 30;
export const REEL_DURATION_SEC = 12;
export const REEL_FRAMES = REEL_FPS * REEL_DURATION_SEC; // 360
export const REEL_WIDTH = 1080;
export const REEL_HEIGHT = 1920;

export const ReelPropsSchema = z.object({
  dateISO: z.string(),
  sunsetDisplay: z.string(),
  score: z.number(),
  label: z.string(),
  /** Score-adaptive eyebrow shown above the spot name (e.g. "Head to" / "Catch it at"). */
  eyebrow: z.string(),
  spotName: z.string(),
  spotBlurb: z.string(),
  clouds: z.object({
    low: z.number(),
    mid: z.number(),
    high: z.number(),
  }),
  visibilityKm: z.number(),
  /** Path under public/, e.g. "spots/kitsilano-beach.jpg". null → gradient fallback. */
  photoFile: z.string().nullable(),
  /** Unsplash photographer handle for attribution overlay, e.g. "@username". */
  photoCredit: z.string().nullable(),
  /** Path under public/, e.g. "audio/01-dusk.mp3". null → silent. */
  audioFile: z.string().nullable(),
});

export type ReelProps = z.infer<typeof ReelPropsSchema>;

export const DEFAULT_REEL_PROPS: ReelProps = {
  dateISO: "2026-06-21",
  sunsetDisplay: "9:23 PM",
  score: 50,
  label: "👍 Decent",
  eyebrow: "Catch it at",
  spotName: "Kitsilano Beach",
  spotBlurb: "Downtown silhouette across the water",
  clouds: { low: 0, mid: 0, high: 0 },
  visibilityKm: 35,
  photoFile: null,
  photoCredit: null,
  audioFile: null,
};
