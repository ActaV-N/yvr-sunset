export interface Spot {
  /** kebab-case identifier used as file slug */
  slug: string;
  name: string;
  /** Korean display name for bilingual captions */
  nameKo: string;
  blurb: string;
  /** Unsplash search query for the background photo */
  unsplashQuery: string;
}

export const SPOTS: readonly Spot[] = [
  {
    slug: "english-bay",
    name: "English Bay",
    nameKo: "잉글리시 베이",
    blurb: "Iconic west-end seawall view",
    unsplashQuery: "English Bay Vancouver beach sunset",
  },
  {
    slug: "spanish-banks",
    name: "Spanish Banks",
    nameKo: "스패니시 뱅크스",
    blurb: "Wide-open horizon, North Shore backdrop",
    unsplashQuery: "Spanish Banks Vancouver beach",
  },
  {
    slug: "jericho-beach",
    name: "Jericho Beach",
    nameKo: "제리코 비치",
    blurb: "Driftwood foreground & city skyline",
    unsplashQuery: "Jericho Beach Vancouver",
  },
  {
    slug: "kitsilano-beach",
    name: "Kitsilano Beach",
    nameKo: "키칠라노 비치",
    blurb: "Downtown silhouette across the water",
    unsplashQuery: "Kitsilano Beach Vancouver sunset",
  },
  {
    slug: "third-beach-stanley-park",
    name: "Third Beach",
    nameKo: "써드 비치 (스탠리 파크)",
    blurb: "Quiet, framed by old-growth trees",
    unsplashQuery: "Stanley Park Vancouver beach sunset",
  },
  {
    slug: "queen-elizabeth-park",
    name: "Queen Elizabeth Park",
    nameKo: "퀸 엘리자베스 공원",
    blurb: "Highest point in the city",
    unsplashQuery: "Queen Elizabeth Park Vancouver skyline",
  },
  {
    slug: "cypress-lookout",
    name: "Cypress Lookout",
    nameKo: "사이프러스 전망대",
    blurb: "Above-the-clouds panorama",
    unsplashQuery: "Cypress Mountain Vancouver lookout",
  },
  {
    slug: "locarno-beach",
    name: "Locarno Beach",
    nameKo: "로카르노 비치",
    blurb: "Mellow tide pools, fewer crowds",
    unsplashQuery: "Locarno Beach Vancouver",
  },
];

/**
 * Pick a spot deterministically from a local date "YYYY-MM-DD".
 * Same date → same spot, regardless of time of day / timezone of caller.
 */
export function pickSpotForDate(dateISO: string): Spot {
  let hash = 0;
  for (let i = 0; i < dateISO.length; i++) {
    hash = (hash * 31 + dateISO.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % SPOTS.length;
  return SPOTS[idx]!;
}
