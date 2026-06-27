import { z } from "zod";

export const BRIEFING_FPS = 30;
export const BRIEFING_WIDTH = 1080;
export const BRIEFING_HEIGHT = 1920;

const VoiceSegmentSchema = z.object({
  voiceFile: z.string(),
  subtitleKR: z.string(),
  durationFrames: z.number(),
});

const IntroSceneSchema = VoiceSegmentSchema.extend({});
const OutroSceneSchema = VoiceSegmentSchema.extend({});

const SunsetSceneSchema = VoiceSegmentSchema.extend({
  photoFile: z.string().nullable(),
  dateLabelEn: z.string(),
  score: z.number(),
  spotName: z.string(),
});

const EventSceneSchema = VoiceSegmentSchema.extend({
  photoFile: z.string().nullable(),
  eventName: z.string(),
  venueName: z.string(),
  dateLabelEn: z.string(),
});

export const BriefingReelPropsSchema = z.object({
  weekLabel: z.string(),
  totalDurationFrames: z.number(),
  scenes: z.object({
    intro: IntroSceneSchema,
    sunsetWeek: SunsetSceneSchema.nullable(),
    events: z.array(EventSceneSchema),
    outro: OutroSceneSchema,
  }),
  /** BGM track under public/, e.g., "audio/briefing/01-track.mp3". null → silent BGM. */
  bgmFile: z.string().nullable(),
});

export type BriefingReelProps = z.infer<typeof BriefingReelPropsSchema>;

export const DEFAULT_BRIEFING_PROPS: BriefingReelProps = {
  weekLabel: "Week of Jun 29",
  totalDurationFrames: 30 * 30, // 30s placeholder
  scenes: {
    intro: {
      voiceFile: "voice/placeholder.mp3",
      subtitleKR: "이번 주 밴쿠버",
      durationFrames: 90,
    },
    sunsetWeek: null,
    events: [],
    outro: {
      voiceFile: "voice/placeholder.mp3",
      subtitleKR: "매일의 밴쿠버, @kokio.yvr",
      durationFrames: 120,
    },
  },
  bgmFile: null,
};
