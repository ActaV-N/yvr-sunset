import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONTS } from "../../brand/fonts";
import {
  COLORS,
  EASING,
  FONT_SIZES,
  FONT_WEIGHTS,
  TIMELINE,
  TIMING,
} from "../../brand/tokens";

interface Props {
  credit: string | null;
}

/** Bottom-right micro line — Unsplash ToS compliance + photographer credit. */
export function Attribution({ credit }: Props): React.JSX.Element | null {
  const frame = useCurrentFrame();
  if (!credit) return null;
  const start = TIMELINE.attributionFrom;
  const opacity = interpolate(
    frame,
    [start, start + TIMING.fadeFrames],
    [0, 0.6],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASING.inOut),
    },
  );
  return (
    <div
      style={{
        position: "absolute",
        right: 80,
        bottom: 110,
        fontFamily: FONTS.ui,
        fontSize: FONT_SIZES.micro,
        fontWeight: FONT_WEIGHTS.regular,
        color: COLORS.daylightCream,
        opacity,
        letterSpacing: 1,
      }}
    >
      📸 {credit} / Unsplash
    </div>
  );
}
