import { Easing, interpolate, useCurrentFrame } from "remotion";
import { fitFontSize } from "../../brand/fit";
import { FONTS } from "../../brand/fonts";
import {
  COLORS,
  EASING,
  FONT_SIZES,
  FONT_WEIGHTS,
  LAYOUT,
  LETTER_SPACING,
  SAFE_AREA,
  TEXT_SHADOWS,
  TIMELINE,
  TIMING,
} from "../../brand/tokens";
import { REEL_WIDTH } from "../types";

interface Props {
  /** Score-adaptive lead-in ("Head to" / "Catch it at" / "Quiet tonight at"). */
  eyebrow: string;
  spotName: string;
  spotBlurb: string;
}

const HERO_MAX_WIDTH =
  REEL_WIDTH - LAYOUT.horizontalPaddingPx * 2 - LAYOUT.italicSafetyPx;

/**
 * Center-stage hero. Italic display serif for the spot name (per-line stagger),
 * cream blurb beneath. Each hero line is auto-fit to canvas width so long
 * names ("Queen Elizabeth Park") shrink instead of clipping.
 */
export function SpotReveal({ eyebrow, spotName, spotBlurb }: Props): React.JSX.Element {
  const frame = useCurrentFrame();
  const lines = splitTwoLines(spotName);

  // Compute per-line font size once (deterministic — same every frame).
  const lineSizes = lines.map((line) =>
    fitFontSize({
      text: line,
      withinWidth: HERO_MAX_WIDTH,
      maxSize: FONT_SIZES.hero,
      fontFamily: FONTS.display,
      fontWeight: FONT_WEIGHTS.black,
      italic: true,
      letterSpacingPx: LETTER_SPACING.display,
    }),
  );

  return (
    <div
      style={{
        position: "absolute",
        top: SAFE_AREA.topPx,
        bottom: SAFE_AREA.bottomPx,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: `0 ${LAYOUT.horizontalPaddingPx}px`,
      }}
    >
      <Eyebrow text={eyebrow} frame={frame} />
      {lines.map((line, i) => (
        <HeroLine
          key={`${line}-${i}`}
          text={line}
          fontSize={lineSizes[i]!}
          start={TIMELINE.spotNameFrom + i * TIMING.staggerFrames}
          frame={frame}
        />
      ))}
      <Blurb text={spotBlurb} frame={frame} />
    </div>
  );
}

function Eyebrow({ text, frame }: { text: string; frame: number }): React.JSX.Element {
  const start = TIMELINE.eyebrowFrom;
  const opacity = interpolate(frame, [start, start + TIMING.softEntranceFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASING.soft),
  });
  return (
    <div
      style={{
        fontFamily: FONTS.ui,
        fontSize: FONT_SIZES.body,
        fontWeight: FONT_WEIGHTS.bold,
        letterSpacing: LETTER_SPACING.eyebrow,
        textTransform: "uppercase",
        color: COLORS.sunsetOrange,
        textShadow: TEXT_SHADOWS.body,
        opacity,
        marginBottom: 32,
      }}
    >
      {text}
    </div>
  );
}

function HeroLine({
  text,
  fontSize,
  start,
  frame,
}: {
  text: string;
  fontSize: number;
  start: number;
  frame: number;
}): React.JSX.Element {
  const t = (frame - start) / TIMING.entranceFrames;
  const translateY = interpolate(t, [0, 1], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASING.entrance),
  });
  const opacity = interpolate(
    frame,
    [start, start + TIMING.entranceFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <div
      style={{
        fontFamily: FONTS.display,
        fontStyle: "italic",
        fontWeight: FONT_WEIGHTS.black,
        fontSize,
        lineHeight: 0.92,
        letterSpacing: LETTER_SPACING.display,
        color: COLORS.daylightCream,
        textShadow: TEXT_SHADOWS.hero,
        opacity,
        transform: `translateY(${translateY}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
}

function Blurb({ text, frame }: { text: string; frame: number }): React.JSX.Element {
  const start = TIMELINE.blurbFrom;
  const t = (frame - start) / TIMING.softEntranceFrames;
  const opacity = interpolate(
    frame,
    [start, start + TIMING.softEntranceFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const translateY = interpolate(t, [0, 1], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASING.soft),
  });
  return (
    <div
      style={{
        fontFamily: FONTS.ui,
        fontSize: FONT_SIZES.blurb,
        fontWeight: FONT_WEIGHTS.regular,
        color: COLORS.daylightCream,
        textShadow: TEXT_SHADOWS.body,
        opacity: opacity * 0.9,
        transform: `translateY(${translateY}px)`,
        maxWidth: REEL_WIDTH - LAYOUT.horizontalPaddingPx * 2,
        lineHeight: 1.3,
        marginTop: 40,
      }}
    >
      {text}
    </div>
  );
}

function splitTwoLines(s: string): string[] {
  const words = s.split(" ");
  if (words.length <= 1) return [s];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}
