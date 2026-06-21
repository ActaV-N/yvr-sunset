import { z } from "zod";
import type { HourlyWeather } from "./types";

const ResponseSchema = z.object({
  hourly: z.object({
    time: z.array(z.string()),
    cloud_cover: z.array(z.number()),
    cloud_cover_low: z.array(z.number()),
    cloud_cover_mid: z.array(z.number()),
    cloud_cover_high: z.array(z.number()),
    visibility: z.array(z.number()),
  }),
});

/**
 * Fetch hourly cloud cover + visibility from Open-Meteo for the given date.
 * Returns full 24h day in local tz (America/Vancouver).
 */
export async function fetchHourlyWeather(
  dateISO: string,
  lat: number,
  lng: number,
  tz: string,
): Promise<HourlyWeather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set(
    "hourly",
    "cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility",
  );
  url.searchParams.set("timezone", tz);
  url.searchParams.set("start_date", dateISO);
  url.searchParams.set("end_date", dateISO);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`open-meteo HTTP ${res.status}: ${await res.text()}`);
  }
  const parsed = ResponseSchema.parse(await res.json());
  return {
    time: parsed.hourly.time,
    cloudCover: parsed.hourly.cloud_cover,
    cloudCoverLow: parsed.hourly.cloud_cover_low,
    cloudCoverMid: parsed.hourly.cloud_cover_mid,
    cloudCoverHigh: parsed.hourly.cloud_cover_high,
    visibility: parsed.hourly.visibility,
  };
}
