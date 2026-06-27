import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONTS } from "../../brand/fonts";
import {
  COLORS,
  EASING,
  FONT_SIZES,
  FONT_WEIGHTS,
  LAYOUT,
  LETTER_SPACING,
  TEXT_SHADOWS,
  TIMELINE,
  TIMING,
} from "../../brand/tokens";

interface Props {
  score: number;
  label: string;
}

/**
 * Bottom-left score row: thin orange rule, "SUNSET SCORE" eyebrow, big serif
 * number that counts up from 0, slash + max, then the human label.
 */
export function ScoreCard({ score, label }: Props): React.JSX.Element {
  const frame = useCurrentFrame();
  const start = TIMELINE.scoreFrom;

  const ruleWidth = interpolate(
    frame,
    [start, start + TIMING.softEntranceFrames],
    [0, 180],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASING.entrance),
    },
  );
  const opacity = interpolate(
    frame,
    [start, start + TIMING.softEntranceFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const translateY = interpolate(
    frame,
    [start, start + TIMING.entranceFrames],
    [24, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASING.entrance),
    },
  );

  const counted = Math.round(
    interpolate(
      frame,
      [start, start + TIMING.countUpFrames],
      [0, score],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(...EASING.count),
      },
    ),
  );

  return (
    <div
      style={{
        position: "absolute",
        left: LAYOUT.horizontalPaddingPx,
        bottom: LAYOUT.bottomChipPx,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          height: 4,
          width: ruleWidth,
          background: COLORS.sunsetOrange,
          borderRadius: 2,
          marginBottom: 24,
        }}
      />
      <div
        style={{
          fontFamily: FONTS.ui,
          fontSize: FONT_SIZES.caption,
          fontWeight: FONT_WEIGHTS.bold,
          letterSpacing: LETTER_SPACING.eyebrow,
          textTransform: "uppercase",
          color: COLORS.drift,
          textShadow: TEXT_SHADOWS.body,
          marginBottom: 16,
        }}
      >
        Sunset score
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
        <span
          style={{
            fontFamily: FONTS.display,
            fontStyle: "italic",
            fontWeight: FONT_WEIGHTS.black,
            fontSize: FONT_SIZES.heroNumber,
            lineHeight: 1,
            color: COLORS.sunsetOrange,
            letterSpacing: -4,
            textShadow: TEXT_SHADOWS.hero,
            ...FONTS.tabularNums,
          }}
        >
          {counted}
        </span>
        <span
          style={{
            fontFamily: FONTS.ui,
            fontSize: FONT_SIZES.body,
            fontWeight: FONT_WEIGHTS.regular,
            color: COLORS.drift,
            textShadow: TEXT_SHADOWS.body,
          }}
        >
          / 100
        </span>
      </div>
      <div
        style={{
          fontFamily: FONTS.ui,
          fontSize: FONT_SIZES.label,
          fontWeight: FONT_WEIGHTS.bold,
          color: COLORS.daylightCream,
          textShadow: TEXT_SHADOWS.body,
          marginTop: 12,
        }}
      >
        {label}
      </div>
    </div>
  );
}
