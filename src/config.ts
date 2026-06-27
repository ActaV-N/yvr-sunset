import "dotenv/config";

export const config = {
  lat: Number(process.env.VANCOUVER_LAT ?? 49.2827),
  lng: Number(process.env.VANCOUVER_LNG ?? -123.1207),
  tz: process.env.VANCOUVER_TZ ?? "America/Vancouver",
  ig: {
    userId: process.env.IG_USER_ID ?? "",
    accessToken: process.env.IG_ACCESS_TOKEN ?? "",
    graphVersion: process.env.IG_GRAPH_VERSION ?? "v23.0",
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID ?? "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    bucket: process.env.R2_BUCKET ?? "yvr-sunset",
    publicBaseUrl: (process.env.R2_PUBLIC_BASE_URL ?? "").replace(/\/$/, ""),
  },
  unsplash: {
    accessKey: process.env.UNSPLASH_ACCESS_KEY ?? "",
  },
  ticketmaster: {
    apiKey: process.env.TICKETMASTER_API_KEY ?? "",
  },
} as const;

export function requireIgConfig(): void {
  if (!config.ig.userId || !config.ig.accessToken) {
    throw new Error("IG_USER_ID and IG_ACCESS_TOKEN must be set");
  }
}

export function requireTicketmasterConfig(): void {
  if (!config.ticketmaster.apiKey) {
    throw new Error("TICKETMASTER_API_KEY must be set");
  }
}

export function requireR2Config(): void {
  const r = config.r2;
  if (!r.accountId || !r.accessKeyId || !r.secretAccessKey || !r.publicBaseUrl) {
    throw new Error(
      "R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_BASE_URL must be set",
    );
  }
}
