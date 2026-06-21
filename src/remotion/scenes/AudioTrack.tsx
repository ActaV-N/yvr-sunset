import { Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import { AUDIO } from "../../brand/tokens";

interface Props {
  audioFile: string | null;
}

/**
 * Background music layer. Renders an <Audio> element with branded fade-in/out
 * volume envelope. Skipped entirely if no track is configured (silent reel).
 */
export function AudioTrack({ audioFile }: Props): React.JSX.Element | null {
  const { durationInFrames } = useVideoConfig();
  if (!audioFile) return null;

  const fadeOutStart = durationInFrames - AUDIO.fadeOutFrames;

  return (
    <Audio
      src={staticFile(audioFile)}
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
