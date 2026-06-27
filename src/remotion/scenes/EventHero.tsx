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
  SAFE_AREA,
  TIMELINE,
  TIMING,
} from "../../brand/tokens";
import { EVENT_REEL_WIDTH } from "../event-types";

interface Props {
  eventName: string;
  categoryLabel: string | null;
}

const HERO_MAX_WIDTH =
  EVENT_REEL_WIDTH - LAYOUT.horizontalPaddingPx * 2 - LAYOUT.italicSafetyPx;
/** Below this 1-line size we'd rather break into two balanced lines. */
const ONE_LINE_MIN_SIZE = 120;

/**
 * Center-stage event reveal. Layout strategy:
 *   1. Try the whole name on ONE line via fitFontSize.
 *   2. If that single line shrinks below ONE_LINE_MIN_SIZE, split into two
 *      lines (smart split on punctuation, else word midpoint) and compute
 *      ONE uniform size from the longer line so both lines match visually.
 * This avoids the "big short word + tiny long line" imbalance.
 */
export function EventHero({ eventName, categoryLabel }: Props): React.JSX.Element {
  const frame = useCurrentFrame();
  const { lines, fontSize } = computeHeroLayout(eventName);

  return (
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
      {categoryLabel ? <Eyebrow text={categoryLabel} frame={frame} /> : null}
      {lines.map((line, i) => (
        <HeroLine
          key={`${line}-${i}`}
          text={line}
          fontSize={fontSize}
          start={TIMELINE.spotNameFrom + i * TIMING.staggerFrames}
          frame={frame}
        />
      ))}
    </div>
  );
}

function computeHeroLayout(name: string): { lines: string[]; fontSize: number } {
  const fitArgs = {
    withinWidth: HERO_MAX_WIDTH,
    maxSize: FONT_SIZES.hero,
    fontFamily: FONTS.display,
    fontWeight: FONT_WEIGHTS.black,
    italic: true,
    letterSpacingPx: LETTER_SPACING.displayLoose,
  };

  const oneLineSize = fitFontSize({ text: name, ...fitArgs });
  if (oneLineSize >= ONE_LINE_MIN_SIZE) {
    return { lines: [name], fontSize: oneLineSize };
  }

  const lines = splitTwoLines(name);
  // Uniform size: take the smaller of the per-line fits so the longer line
  // dictates and both render at the same height.
  const sizes = lines.map((l) => fitFontSize({ text: l, ...fitArgs }));
  const uniform = Math.min(...sizes);
  return { lines, fontSize: uniform };
}

function Eyebrow({ text, frame }: { text: string; frame: number }): React.JSX.Element {
  const start = TIMELINE.eyebrowFrom;
  const opacity = interpolate(
    frame,
    [start, start + TIMING.softEntranceFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASING.soft),
    },
  );
  return (
    <div
      style={{
        fontFamily: FONTS.ui,
        fontSize: FONT_SIZES.body,
        fontWeight: FONT_WEIGHTS.bold,
        letterSpacing: LETTER_SPACING.eyebrow,
        textTransform: "uppercase",
        color: COLORS.sunsetOrange,
        opacity,
        marginBottom: 32,
      }}
    >
      {text}
    </div>
  );
}

function HeroLine({
  text,
  fontSize,
  start,
  frame,
}: {
  text: string;
  fontSize: number;
  start: number;
  frame: number;
}): React.JSX.Element {
  const t = (frame - start) / TIMING.entranceFrames;
  const translateY = interpolate(t, [0, 1], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASING.entrance),
  });
  const opacity = interpolate(
    frame,
    [start, start + TIMING.entranceFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <div
      style={{
        fontFamily: FONTS.display,
        fontStyle: "italic",
        fontWeight: FONT_WEIGHTS.black,
        fontSize,
        lineHeight: 1.0,
        letterSpacing: LETTER_SPACING.displayLoose,
        color: COLORS.daylightCream,
        opacity,
        transform: `translateY(${translateY}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
}

function splitTwoLines(s: string): string[] {
  for (const sep of [" — ", " – ", " - ", ": "]) {
    if (s.includes(sep)) {
      const parts = s.split(sep);
      return [parts[0]!, parts.slice(1).join(sep)];
    }
  }
  const words = s.split(" ");
  if (words.length <= 1) return [s];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}
