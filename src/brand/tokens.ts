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
  /** Looser display tracking for italic headlines with variable-width content
   * (e.g., event names with mixed-case + numbers). */
  displayLoose: 0,
  body: 0,
  label: 4,
  eyebrow: 10,
} as const;

// ─── IG Safe Area ─────────────────────────────────────────────────────────────
// IG Reels overlay regions per Meta's Safe Zone spec. Anything inside the top
// and bottom bands is COVERED by IG UI (profile/handle on top, profile bar +
// caption + action icons on bottom). Background visuals can extend edge-to-edge,
// but **critical info text (시각, 점수, 장소, 가격, 로고)** must stay inside the
// usable middle band.
//
// Usable middle = 1920 - 220 - 340 = 1360 px.
export const SAFE_AREA = {
  /** Top region cropped by IG @handle / story title overlay. */
  topPx: 220,
  /** Bottom region covered by profile bar + caption + action icons. */
  bottomPx: 340,
  /** Inner padding inside the safe zone (visual breathing room). */
  insetPx: 40,
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────
// Derived placement constants. Anchored to SAFE_AREA so any reel composition
// inherits the same critical-content zone automatically.
export const LAYOUT = {
  /** Outer horizontal padding for any text block. */
  horizontalPaddingPx: 80,
  /** Extra safety margin to absorb italic glyph overhang. */
  italicSafetyPx: 40,
  /** Top-bar (rule + label row) distance from canvas top.
   * Sits below LOGO with breathing room, fully inside safe zone. */
  topBarPx: 460,
  /** Bottom chip (ScoreCard / EventMeta / Attribution) `bottom` value.
   * Equals SAFE_AREA.bottomPx + SAFE_AREA.insetPx → chip's bottom edge sits at
   * 1920 - 380 = 1540, comfortably above the IG profile/caption overlay. */
  bottomChipPx: 380,
} as const;

// ─── Logo ─────────────────────────────────────────────────────────────────────
// Top-left masthead placement. Persistent — fades in once with the top bar.
// Moved down to clear SAFE_AREA.topPx (was 60 → covered by IG @handle).
export const LOGO = {
  /** Path under public/, used with staticFile(). */
  src: "logo_transparent.png",
  /** Width/height in px (square logo). */
  sizePx: 100,
  /** Distance from canvas top. SAFE_AREA.topPx + SAFE_AREA.insetPx. */
  topPx: 260,
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

// ─── Photo legibility ────────────────────────────────────────────────────────
// 사진 배경 위 텍스트 가독성 3단 레이어:
//   1. photoFilter — 사진 자체에 desaturate + brightness 다운 + contrast 약간 +
//   2. top/bottom scrim — 텍스트가 사는 상단/하단 띠를 dark gradient 로 덮어서
//      중앙(사진 메인 피사체)은 vivid 유지
//   3. textShadow — 텍스트 컴포넌트에 적용되는 마지막 안전망 (sticker 안 됨 정도로 subtle)
//
// PhotoBg 가 이미 적용하므로 새 reel 만들 때 별도로 신경 쓸 일 없음.
// 사진이 유난히 밝거나 colorful 한 케이스에서 가독성이 떨어지면 여기 값만 조정.
export const PHOTO_OVERLAY = {
  /** Top band scrim — 상단(로고 + top bar) 가독성 보장. 0~30% 높이 구간. */
  topScrimAlpha: 0.6,
  /** Bottom band scrim — 하단(hero + 칩) 가독성 보장. 55%~100% 구간. */
  bottomScrimAlpha: 0.85,
  /** Edge vignette intensity (radial). */
  vignetteAlpha: 0.5,
  /** Photo 자체에 적용되는 CSS filter. saturate < 1 + brightness < 1 로 톤 통일. */
  photoFilter: "saturate(0.92) brightness(0.82) contrast(1.05)",
} as const;

export const TEXT_SHADOWS = {
  /** 작은 텍스트 (라벨/캡션/칩) — 살짝 띄움. */
  body: "0 2px 8px rgba(0, 0, 0, 0.5)",
  /** Hero/큰 숫자 — 더 멀리 퍼지는 그림자로 깊이감. */
  hero: "0 4px 20px rgba(0, 0, 0, 0.55)",
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
