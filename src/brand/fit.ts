import { fitText } from "@remotion/layout-utils";

/**
 * Compute a font size that fits `text` inside `withinWidth`, never exceeding
 * `maxSize`. Wraps @remotion/layout-utils.fitText with a sensible cap so short
 * words don't blow up beyond the design token.
 */
export function fitFontSize(args: {
  text: string;
  withinWidth: number;
  maxSize: number;
  fontFamily: string;
  fontWeight: number;
  italic?: boolean;
  letterSpacingPx?: number;
}): number {
  const result = fitText({
    text: args.text,
    withinWidth: args.withinWidth,
    fontFamily: args.fontFamily,
    fontWeight: String(args.fontWeight),
    letterSpacing: args.letterSpacingPx != null ? `${args.letterSpacingPx}px` : undefined,
    additionalStyles: args.italic ? { fontStyle: "italic" } : undefined,
  });
  return Math.min(result.fontSize, args.maxSize);
}
