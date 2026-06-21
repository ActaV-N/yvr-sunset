export interface Spot {
  /** kebab-case identifier used as file slug */
  slug: string;
  name: string;
  blurb: string;
  /** Unsplash search query for the background photo */
  unsplashQuery: string;
}

export const SPOTS: readonly Spot[] = [
  {
    slug: "english-bay",
    name: "English Bay",
    blurb: "Iconic west-end seawall view",
    unsplashQuery: "English Bay Vancouver beach sunset",
  },
  {
    slug: "spanish-banks",
    name: "Spanish Banks",
    blurb: "Wide-open horizon, North Shore backdrop",
    unsplashQuery: "Spanish Banks Vancouver beach",
  },
  {
    slug: "jericho-beach",
    name: "Jericho Beach",
    blurb: "Driftwood foreground & city skyline",
    unsplashQuery: "Jericho Beach Vancouver",
  },
  {
    slug: "kitsilano-beach",
    name: "Kitsilano Beach",
    blurb: "Downtown silhouette across the water",
    unsplashQuery: "Kitsilano Beach Vancouver sunset",
  },
  {
    slug: "third-beach-stanley-park",
    name: "Third Beach",
    blurb: "Quiet, framed by old-growth trees",
    unsplashQuery: "Stanley Park Vancouver beach sunset",
  },
  {
    slug: "queen-elizabeth-park",
    name: "Queen Elizabeth Park",
    blurb: "Highest point in the city",
    unsplashQuery: "Queen Elizabeth Park Vancouver skyline",
  },
  {
    slug: "cypress-lookout",
    name: "Cypress Lookout",
    blurb: "Above-the-clouds panorama",
    unsplashQuery: "Cypress Mountain Vancouver lookout",
  },
  {
    slug: "locarno-beach",
    name: "Locarno Beach",
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
