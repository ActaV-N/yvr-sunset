import { Easing, interpolate, useCurrentFrame } from "remotion";
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
import { PhotoBg } from "../PhotoBg";

interface Props {
  photoFile: string | null;
  dateLabelEn: string;
  score: number;
  spotName: string;
}

export function SunsetWeekScene({
  photoFile,
  dateLabelEn,
  score,
  spotName,
}: Props): React.JSX.Element {
  const frame = useCurrentFrame();
  const headerOpacity = interpolate(
    frame,
    [0, TIMING.softEntranceFrames],
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
  const heroOpacity = interpolate(
    frame,
    [TIMING.staggerFrames, TIMING.staggerFrames + TIMING.entranceFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

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
          Last week · best sunset
        </div>
        <div
          style={{
            fontFamily: FONTS.ui,
            fontSize: FONT_SIZES.body,
            fontWeight: FONT_WEIGHTS.bold,
            color: COLORS.drift,
            textShadow: TEXT_SHADOWS.body,
            opacity: headerOpacity,
            marginBottom: 28,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {dateLabelEn}
        </div>

        <div
          style={{
            fontFamily: FONTS.display,
            fontStyle: "italic",
            fontWeight: FONT_WEIGHTS.black,
            fontSize: 180,
            lineHeight: 0.95,
            letterSpacing: LETTER_SPACING.displayLoose,
            color: COLORS.daylightCream,
            textShadow: TEXT_SHADOWS.hero,
            transform: `translateY(${heroTranslate}px)`,
            opacity: heroOpacity,
            whiteSpace: "pre-line",
          }}
        >
          {spotName}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginTop: 32,
            opacity: heroOpacity,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.display,
              fontStyle: "italic",
              fontWeight: FONT_WEIGHTS.black,
              fontSize: 140,
              lineHeight: 1,
              color: COLORS.sunsetOrange,
              letterSpacing: -4,
              textShadow: TEXT_SHADOWS.hero,
              ...FONTS.tabularNums,
            }}
          >
            {score}
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
      </div>
    </>
  );
}
