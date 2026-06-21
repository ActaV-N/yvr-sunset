import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONTS } from "../../brand/fonts";
import {
  COLORS,
  EASING,
  FONT_SIZES,
  FONT_WEIGHTS,
  LETTER_SPACING,
  TIMELINE,
  TIMING,
} from "../../brand/tokens";

interface Props {
  sunsetDisplay: string;
}

/**
 * Editorial top row: thin accent rule, label on the left, monospaced-feel
 * sunset time on the right. Stays for the entire reel after entrance.
 */
export function TopBar({ sunsetDisplay }: Props): React.JSX.Element {
  const frame = useCurrentFrame();
  const start = TIMELINE.topFrom;
  const t = (frame - start) / TIMING.entranceFrames;

  const ruleWidth = interpolate(t, [0, 1], [0, 220], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASING.entrance),
  });
  const opacity = interpolate(
    frame,
    [start, start + TIMING.softEntranceFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const translateY = interpolate(t, [0, 1], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASING.entrance),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 80,
        right: 80,
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
          marginBottom: 28,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          fontFamily: FONTS.ui,
          color: COLORS.daylightCream,
        }}
      >
        <span
          style={{
            fontSize: FONT_SIZES.caption,
            fontWeight: FONT_WEIGHTS.bold,
            letterSpacing: LETTER_SPACING.eyebrow,
            textTransform: "uppercase",
            color: COLORS.drift,
          }}
        >
          Tonight in Vancouver
        </span>
        <span
          style={{
            fontSize: FONT_SIZES.numeral,
            fontWeight: FONT_WEIGHTS.black,
            letterSpacing: LETTER_SPACING.body,
            color: COLORS.daylightCream,
            ...FONTS.tabularNums,
          }}
        >
          {sunsetDisplay}
        </span>
      </div>
    </div>
  );
}
