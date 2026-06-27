import type { CuratedEvent } from "../events/types";
import type { Spot } from "../spots/spots";
import type { VoiceSegment } from "../voice/types";

/** A specific day in the past week that had the best sunset. */
export interface BestSunsetOfWeek {
  /** Local date "YYYY-MM-DD". */
  dateISO: string;
  /** English day-of-week label, e.g., "Wednesday". */
  dayLabelEn: string;
  /** Korean day-of-week label, e.g., "수요일". */
  dayLabelKo: string;
  /** 0–100 score. */
  score: number;
  /** Spot rotated for that day. */
  spot: Spot;
  /** Path under public/ for cached photo, null → gradient fallback. */
  photoFile: string | null;
}

/**
 * A briefing reel's script + asset references. Built deterministically from the
 * publish date.  segments.intro/sunsetWeek/events/outro carry voice + subtitle
 * text. TTS-derived fields (audioFile, durationFrames) are filled in B2.
 */
export interface BriefingScript {
  /** Local publish date "YYYY-MM-DD". */
  dateISO: string;
  /** Week range label shown on the intro card, e.g., "Week of Jun 29". */
  weekLabel: string;

  segments: {
    intro: VoiceSegment;
    sunsetWeek: VoiceSegment;
    events: VoiceSegment[];
    outro: VoiceSegment;
  };

  /** Underlying context — visuals + raw values for compositions. */
  context: {
    bestSunset: BestSunsetOfWeek | null;
    topEvents: CuratedEvent[];
  };
}
