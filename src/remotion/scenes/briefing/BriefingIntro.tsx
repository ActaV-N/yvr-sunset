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

interface Props {
  weekLabel: string;
}

/**
 * Open card: dusk gradient + big italic "This week in Vancouver" + week label.
 * Logo stays handled at composition level (drawn over every scene).
 */
export function BriefingIntro({ weekLabel }: Props): React.JSX.Element {
  const frame = useCurrentFrame();

  const titleTranslate = interpolate(frame, [0, TIMING.entranceFrames], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASING.entrance),
  });
  const titleOpacity = interpolate(frame, [0, TIMING.entranceFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const labelOpacity = interpolate(
    frame,
    [TIMING.staggerFrames, TIMING.staggerFrames + TIMING.softEntranceFrames],
    [0, 1],
    { extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill>
      {/* Dusk gradient bg */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg,
            ${COLORS.midnightInk} 0%,
            #2a1b3d 30%,
            #6b2c3a 60%,
            ${COLORS.sunsetOrange} 92%,
            ${COLORS.goldenHour} 100%)`,
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
          alignItems: "flex-start",
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
            opacity: labelOpacity,
            marginBottom: 24,
          }}
        >
          {weekLabel}
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
            opacity: titleOpacity,
            transform: `translateY(${titleTranslate}px)`,
          }}
        >
          This week
          <br />
          in Vancouver
        </div>
      </div>
    </AbsoluteFill>
  );
}
