import { Audio, interpolate, useVideoConfig } from "remotion";
import { AUDIO } from "../../brand/tokens";

interface Props {
  /** Full https URL to mp3 (typically R2 public URL). null → silent. */
  audioFile: string | null;
}

/**
 * Background music layer. Renders <Audio> with branded fade-in/out volume envelope.
 * Accepts a full URL (Remotion Chromium fetches at render via HTTP range requests).
 * Silent (no element) if no track configured.
 */
export function AudioTrack({ audioFile }: Props): React.JSX.Element | null {
  const { durationInFrames } = useVideoConfig();
  if (!audioFile) return null;

  const fadeOutStart = durationInFrames - AUDIO.fadeOutFrames;

  return (
    <Audio
      src={audioFile}
      volume={(frame) =>
        interpolate(
          frame,
          [0, AUDIO.fadeInFrames, fadeOutStart, durationInFrames],
          [0, AUDIO.bodyVolume, AUDIO.bodyVolume, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
  );
}
