import { Easing, interpolate, useCurrentFrame } from "remotion";
import { fitFontSize } from "../../../brand/fit";
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
import { BRIEFING_WIDTH } from "../../briefing-types";
import { PhotoBg } from "../PhotoBg";

interface Props {
  photoFile: string | null;
  eventName: string;
  venueName: string;
  dateLabelEn: string;
}

const HERO_MAX_WIDTH =
  BRIEFING_WIDTH - LAYOUT.horizontalPaddingPx * 2 - LAYOUT.italicSafetyPx;

export function EventCardScene({
  photoFile,
  eventName,
  venueName,
  dateLabelEn,
}: Props): React.JSX.Element {
  const frame = useCurrentFrame();
  const headerOpacity = interpolate(
    frame,
    [0, TIMING.softEntranceFrames],
    [0, 1],
    { extrapolateRight: "clamp" },
  );
  const heroOpacity = interpolate(
    frame,
    [TIMING.staggerFrames, TIMING.staggerFrames + TIMING.entranceFrames],
    [0, 1],
    { extrapolateRight: "clamp" },
  );
  const heroTranslate = interpolate(
    frame,
    [TIMING.staggerFrames, TIMING.staggerFrames + TIMING.entranceFrames],
    [40, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASING.entrance),
    },
  );

  const heroSize = fitFontSize({
    text: eventName,
    withinWidth: HERO_MAX_WIDTH,
    maxSize: 160,
    fontFamily: FONTS.display,
    fontWeight: FONT_WEIGHTS.black,
    italic: true,
    letterSpacingPx: LETTER_SPACING.displayLoose,
  });

  return (
    <>
      <PhotoBg photoFile={photoFile} />
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
            opacity: headerOpacity,
            marginBottom: 16,
          }}
        >
          Event · {dateLabelEn}
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontStyle: "italic",
            fontWeight: FONT_WEIGHTS.black,
            fontSize: heroSize,
            lineHeight: 0.95,
            letterSpacing: LETTER_SPACING.displayLoose,
            color: COLORS.daylightCream,
            textShadow: TEXT_SHADOWS.hero,
            opacity: heroOpacity,
            transform: `translateY(${heroTranslate}px)`,
            whiteSpace: "nowrap",
          }}
        >
          {eventName}
        </div>
        <div
          style={{
            fontFamily: FONTS.ui,
            fontSize: FONT_SIZES.body,
            fontWeight: FONT_WEIGHTS.bold,
            color: COLORS.daylightCream,
            textShadow: TEXT_SHADOWS.body,
            marginTop: 32,
            textTransform: "uppercase",
            letterSpacing: 1,
            opacity: heroOpacity,
          }}
        >
          {venueName}
        </div>
      </div>
    </>
  );
}
