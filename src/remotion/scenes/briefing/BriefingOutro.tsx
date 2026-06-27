import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONTS } from "../../../brand/fonts";
import {
  COLORS,
  EASING,
  FONT_SIZES,
  FONT_WEIGHTS,
  LAYOUT,
  LETTER_SPACING,
  SAFE_AREA,
  TEXT_SHADOWS,
  TIMING,
} from "../../../brand/tokens";

export function BriefingOutro(): React.JSX.Element {
  const frame = useCurrentFrame();
  const handleOpacity = interpolate(frame, [0, TIMING.entranceFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASING.entrance),
  });
  const handleTranslate = interpolate(
    frame,
    [0, TIMING.entranceFrames],
    [30, 0],
    {
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASING.entrance),
    },
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg,
            ${COLORS.midnightInk} 0%,
            #2a1b3d 60%,
            ${COLORS.sunsetOrange} 100%)`,
        }}
      />
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
          alignItems: "center",
          textAlign: "center",
          padding: `0 ${LAYOUT.horizontalPaddingPx}px`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.ui,
            fontSize: FONT_SIZES.caption,
            fontWeight: FONT_WEIGHTS.bold,
            letterSpacing: LETTER_SPACING.eyebrow,
            textTransform: "uppercase",
            color: COLORS.sunsetOrange,
            textShadow: TEXT_SHADOWS.body,
            opacity: handleOpacity,
            marginBottom: 32,
          }}
        >
          Follow the daily
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontStyle: "italic",
            fontWeight: FONT_WEIGHTS.black,
            fontSize: 160,
            lineHeight: 0.95,
            letterSpacing: LETTER_SPACING.displayLoose,
            color: COLORS.daylightCream,
            textShadow: TEXT_SHADOWS.hero,
            opacity: handleOpacity,
            transform: `translateY(${handleTranslate}px)`,
          }}
        >
          @kokio.yvr
        </div>
      </div>
    </AbsoluteFill>
  );
}
