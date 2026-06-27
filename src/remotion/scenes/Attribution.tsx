import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONTS } from "../../brand/fonts";
import {
  COLORS,
  EASING,
  FONT_SIZES,
  FONT_WEIGHTS,
  LAYOUT,
  TEXT_SHADOWS,
  TIMELINE,
  TIMING,
} from "../../brand/tokens";

interface Props {
  /** Already-formatted attribution text. null → render nothing. */
  text: string | null;
}

/**
 * Bottom-right micro line — source attribution. Callers pre-format the string
 * (icon + label + source) so this component stays content-agnostic.
 * Examples:
 *  - "📸 @kaprion / Unsplash"
 *  - "🎟 via Ticketmaster"
 */
export function Attribution({ text }: Props): React.JSX.Element | null {
  const frame = useCurrentFrame();
  if (!text) return null;
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
        right: LAYOUT.horizontalPaddingPx,
        bottom: LAYOUT.bottomChipPx,
        fontFamily: FONTS.ui,
        fontSize: FONT_SIZES.micro,
        fontWeight: FONT_WEIGHTS.regular,
        color: COLORS.daylightCream,
        textShadow: TEXT_SHADOWS.body,
        opacity,
        letterSpacing: 1,
      }}
    >
      {text}
    </div>
  );
}
