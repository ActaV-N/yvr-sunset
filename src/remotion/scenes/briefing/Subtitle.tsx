import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FONTS } from "../../../brand/fonts";
import {
  COLORS,
  EASING,
  FONT_SIZES,
  FONT_WEIGHTS,
  LAYOUT,
  SAFE_AREA,
  TEXT_SHADOWS,
} from "../../../brand/tokens";

interface Props {
  text: string;
}

/**
 * Bottom-anchored Korean subtitle. Same position across every briefing scene
 * so the viewer reads continuous flow without their eye jumping.
 *
 * Sits inside the IG safe zone (bottom: SAFE_AREA.bottomPx + insetPx).
 * Frame-relative fade-in so each scene's subtitle appears smoothly.
 */
export function Subtitle({ text }: Props): React.JSX.Element {
  const frame = useCurrentFrame();
  // Frame inside the parent <Sequence> starts at 0 for the new scene → fade in.
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASING.inOut),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: LAYOUT.horizontalPaddingPx,
        right: LAYOUT.horizontalPaddingPx,
        bottom: SAFE_AREA.bottomPx + SAFE_AREA.insetPx,
        textAlign: "center",
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.subtitleKR,
          fontSize: FONT_SIZES.blurb,
          fontWeight: FONT_WEIGHTS.semibold,
          lineHeight: 1.35,
          letterSpacing: -0.5,
          color: COLORS.daylightCream,
          textShadow: TEXT_SHADOWS.body,
        }}
      >
        {text}
      </div>
    </div>
  );
}
