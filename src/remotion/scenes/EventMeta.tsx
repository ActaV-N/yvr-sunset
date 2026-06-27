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
  TIMELINE,
  TIMING,
} from "../../brand/tokens";
import { EVENT_REEL_WIDTH } from "../event-types";

interface Props {
  venueName: string;
  priceLabel: string | null;
}

const START = TIMELINE.scoreFrom;

/**
 * Reserve right-edge space for the bottom-right <Attribution> ("🎟 via Ticketmaster")
 * so the venue chip never collides with it.
 */
const ATTRIBUTION_BUFFER_PX = 400;
const VENUE_MAX_WIDTH =
  EVENT_REEL_WIDTH - LAYOUT.horizontalPaddingPx - ATTRIBUTION_BUFFER_PX;

/**
 * Bottom-left venue + price block. Mirrors ScoreCard placement so the family
 * reads consistently (always look here for "the practical detail").
 */
export function EventMeta({ venueName, priceLabel }: Props): React.JSX.Element {
  const frame = useCurrentFrame();

  const venueSize = fitFontSize({
    text: venueName.toUpperCase(),
    withinWidth: VENUE_MAX_WIDTH,
    maxSize: FONT_SIZES.label,
    fontFamily: FONTS.ui,
    fontWeight: FONT_WEIGHTS.black,
    letterSpacingPx: 0,
  });

  const ruleWidth = interpolate(
    frame,
    [START, START + TIMING.softEntranceFrames],
    [0, 180],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASING.entrance),
    },
  );
  const opacity = interpolate(
    frame,
    [START, START + TIMING.softEntranceFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const translateY = interpolate(
    frame,
    [START, START + TIMING.entranceFrames],
    [24, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASING.entrance),
    },
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
          marginBottom: 12,
        }}
      >
        Venue
      </div>
      <div
        style={{
          fontFamily: FONTS.ui,
          fontSize: venueSize,
          fontWeight: FONT_WEIGHTS.black,
          color: COLORS.daylightCream,
          letterSpacing: 0,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {venueName.toUpperCase()}
      </div>
      {priceLabel ? (
        <div
          style={{
            fontFamily: FONTS.ui,
            fontSize: FONT_SIZES.body,
            fontWeight: FONT_WEIGHTS.bold,
            color: COLORS.sunsetOrange,
            marginTop: 16,
            letterSpacing: LETTER_SPACING.label,
            textTransform: "uppercase",
            ...FONTS.tabularNums,
          }}
        >
          {priceLabel}
        </div>
      ) : null}
    </div>
  );
}
