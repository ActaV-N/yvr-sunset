/**
 * YVR Sunset — Brand Tokens
 *
 * Single source of truth for color, typography, easing, timing.
 * Documented in docs/BRAND.md. Do not introduce magic numbers in scenes;
 * extend this file instead.
 */

// ─── Color ────────────────────────────────────────────────────────────────────
// "Cinematic dusk" — single bright accent over deep ink. Cream over pure white
// keeps the magazine feel.
export const COLORS = {
  /** Brand signature. Used sparingly: time, score number, accent rules. */
  sunsetOrange: "#FF5A1F",
  /** Secondary heat. Soft glow, golden-hour highlights. */
  goldenHour: "#FFC857",
  /** Deepest dark — main background fallback, vignette base. */
  midnightInk: "#0B0B14",
  /** Mid surface — chips, cards, glass panels (used at ~70% alpha). */
  twilight: "#1F1F2E",
  /** Primary text on dark. Warmer than pure white. */
  daylightCream: "#F5EFE6",
  /** Secondary text — labels, units, attribution. */
  drift: "#7A7A8C",
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
// Two faces only. Display (Fraunces italic 900) carries personality.
// UI (Inter Tight) carries everything else. Numerics always tabular.
export const FONT_WEIGHTS = {
  regular: 500,
  semibold: 700,
  bold: 800,
  black: 900,
} as const;

export const FONT_SIZES = {
  micro: 22,
  caption: 28,
  body: 38,
  blurb: 44,
  label: 48,
  numeral: 56,
  hero: 220,
  heroNumber: 200,
} as const;

export const LETTER_SPACING = {
  tight: -8,
  display: -4,
  body: 0,
  label: 4,
  eyebrow: 10,
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────
// Safe areas inside the 1080×1920 canvas. Use these (not magic px) for any
// new horizontal/vertical block.
export const LAYOUT = {
  /** Outer horizontal padding for any text block. */
  horizontalPaddingPx: 80,
  /** Extra safety margin to absorb italic glyph overhang. */
  italicSafetyPx: 40,
  /** Top-bar (rule + "TONIGHT IN VANCOUVER · 9:23 PM") distance from canvas top. */
  topBarPx: 200,
} as const;

// ─── Logo ─────────────────────────────────────────────────────────────────────
// Top-left masthead placement. Persistent — fades in once with the top bar.
export const LOGO = {
  /** Path under public/, used with staticFile(). */
  src: "logo_transparent.png",
  /** Width/height in px (square logo). */
  sizePx: 100,
  /** Distance from canvas top. */
  topPx: 60,
  /** Distance from canvas left. Matches LAYOUT.horizontalPaddingPx so logo aligns with top-bar rule. */
  leftPx: 80,
} as const;

// ─── Easing ───────────────────────────────────────────────────────────────────
// Use cubic-bezier curves, NOT spring physics. Springs feel bouncy / "app-like";
// curves feel cinematic. Pick one per intent and reuse.
//
// Apply with: interpolate(frame, [a, b], [from, to], { easing: EASING.entrance })
// (via Easing.bezier from "remotion" — see fonts.ts / scene examples).
export const EASING = {
  /** Primary entrance — confident swoop. Use for hero elements. */
  entrance: [0.16, 1, 0.3, 1] as const,
  /** Secondary entrance — softer, for supporting text. */
  soft: [0.25, 1, 0.5, 1] as const,
  /** Cross-fades, color shifts, anything bidirectional. */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Number counters, monotonic growth. */
  count: [0.33, 1, 0.68, 1] as const,
} as const;

// ─── Timing ───────────────────────────────────────────────────────────────────
// Frame-based (30fps). Every entrance reuses one of these durations.
export const TIMING = {
  /** Hero entrance — spot name, time. */
  entranceFrames: 24,
  /** Secondary entrance — eyebrow, blurb, score. */
  softEntranceFrames: 18,
  /** Cross-fade duration. */
  fadeFrames: 12,
  /** Number count-up. */
  countUpFrames: 30,
  /** Stagger between sibling reveals (multi-line headlines, list items). */
  staggerFrames: 6,
} as const;

// ─── Audio ────────────────────────────────────────────────────────────────────
// Background music volume + fade behavior. One source of truth so all tracks
// feel consistent regardless of source mastering.
export const AUDIO = {
  /** Peak volume during the body of the reel. Keep under 1 so loud masters don't clip. */
  bodyVolume: 0.75,
  /** Fade-in / fade-out durations in frames. Avoid abrupt cuts at the start/end. */
  fadeInFrames: 15,
  fadeOutFrames: 30,
} as const;

// ─── Scene timeline ───────────────────────────────────────────────────────────
// Single source of when each layer appears. Reordering = edit here, not in components.
export const TIMELINE = {
  /** Photo Ken Burns + base background. */
  photoFrom: 0,
  /** Top rule + "TONIGHT IN VANCOUVER" + sunset time. */
  topFrom: 12,
  /** "HEAD TO" eyebrow. */
  eyebrowFrom: 40,
  /** Spot name (italic display). Each line staggers by TIMING.staggerFrames. */
  spotNameFrom: 60,
  /** Blurb under spot name. */
  blurbFrom: 110,
  /** Score row + score rule. */
  scoreFrom: 140,
  /** Attribution micro-text. */
  attributionFrom: 180,
} as const;
