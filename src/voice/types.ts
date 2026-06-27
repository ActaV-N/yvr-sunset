/**
 * A single voiced segment of a multi-scene reel.
 *
 *   voiceText    — EN script spoken by TTS (drives mp3 generation in B2)
 *   subtitleText — KR text rendered on-screen during the segment
 *   audioFile    — public/ path to cached mp3, null until B2 fills it
 *   durationFrames — Frames the segment occupies, derived from mp3 duration in B2
 */
export interface VoiceSegment {
  voiceText: string;
  subtitleText: string;
  audioFile: string | null;
  durationFrames: number;
}
