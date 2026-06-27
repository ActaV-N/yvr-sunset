import { AbsoluteFill } from "remotion";
import { FONTS } from "../brand/fonts";
import { COLORS } from "../brand/tokens";
import { Attribution } from "./scenes/Attribution";
import { AudioTrack } from "./scenes/AudioTrack";
import { Logo } from "./scenes/Logo";
import { PhotoBg } from "./scenes/PhotoBg";
import { ScoreCard } from "./scenes/ScoreCard";
import { SpotReveal } from "./scenes/SpotReveal";
import { TopBar } from "./scenes/TopBar";
import type { ReelProps } from "./types";

export function SunsetReel(props: ReelProps): React.JSX.Element {
  return (
    <AbsoluteFill
      style={{
        fontFamily: FONTS.ui,
        background: COLORS.midnightInk,
        color: COLORS.daylightCream,
      }}
    >
      <PhotoBg photoFile={props.photoFile} />
      <Logo />
      <TopBar sunsetDisplay={props.sunsetDisplay} />
      <SpotReveal
        eyebrow={props.eyebrow}
        spotName={props.spotName}
        spotBlurb={props.spotBlurb}
      />
      <ScoreCard score={props.score} label={props.label} />
      <Attribution
        text={props.photoCredit ? `📸 ${props.photoCredit} / Unsplash` : null}
      />
      <AudioTrack audioFile={props.audioFile} />
    </AbsoluteFill>
  );
}
