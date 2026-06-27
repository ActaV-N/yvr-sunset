import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadNotoSansKR } from "@remotion/google-fonts/NotoSansKR";

/**
 * Brand typefaces. Loaded at module evaluation time so Remotion bundle waits
 * for them before rendering — no FOUT in output frames.
 *
 *  - Display: Fraunces italic, weight 900. Editorial / magazine personality.
 *  - UI:      Inter Tight, weights 500–900. Tabular numerals enabled where used.
 *  - Subtitle (KR): Noto Sans KR, weights 500–800. Only for Korean subtitles
 *                  in BriefingReel — Inter Tight is Latin-only.
 *
 * Add new weights/variants here; never call loadFont() from components.
 */

const fraunces = loadFraunces("italic", { weights: ["900"], subsets: ["latin"] });
const interTight = loadInterTight("normal", {
  weights: ["500", "700", "800", "900"],
  subsets: ["latin"],
});
const notoSansKR = loadNotoSansKR("normal", {
  weights: ["500", "700"],
});

export const FONTS = {
  display: fraunces.fontFamily,
  ui: interTight.fontFamily,
  /** Korean subtitle face — used only where on-screen KR text appears. */
  subtitleKR: notoSansKR.fontFamily,
  /** Apply to any numeric element for column-aligned digits. */
  tabularNums: { fontVariantNumeric: "tabular-nums" } as const,
} as const;
