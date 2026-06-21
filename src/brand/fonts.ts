import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";

/**
 * Brand typefaces. Loaded at module evaluation time so Remotion bundle waits
 * for them before rendering — no FOUT in output frames.
 *
 *  - Display: Fraunces italic, weight 900. Editorial / magazine personality.
 *  - UI:      Inter Tight, weights 500–900. Tabular numerals enabled where used.
 *
 * Add new weights/variants here; never call loadFont() from components.
 */

const fraunces = loadFraunces("italic", { weights: ["900"], subsets: ["latin"] });
const interTight = loadInterTight("normal", {
  weights: ["500", "700", "800", "900"],
  subsets: ["latin"],
});

export const FONTS = {
  display: fraunces.fontFamily,
  ui: interTight.fontFamily,
  /** Apply to any numeric element for column-aligned digits. */
  tabularNums: { fontVariantNumeric: "tabular-nums" } as const,
} as const;
