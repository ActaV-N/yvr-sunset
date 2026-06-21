import { z } from "zod";
import type { SunsetTimes } from "./types";

const ResponseSchema = z.object({
  status: z.string(),
  results: z.object({
    sunrise: z.string(),
    sunset: z.string(),
    solar_noon: z.string(),
    day_length: z.number(),
  }),
});

/**
 * Fetch sunrise/sunset for a given date and location.
 * @param dateISO local date "YYYY-MM-DD"
 */
export async function fetchSunsetTimes(
  dateISO: string,
  lat: number,
  lng: number,
): Promise<SunsetTimes> {
  const url = new URL("https://api.sunrise-sunset.org/json");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));
  url.searchParams.set("date", dateISO);
  url.searchParams.set("formatted", "0");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`sunrise-sunset.org HTTP ${res.status}: ${await res.text()}`);
  }
  const parsed = ResponseSchema.parse(await res.json());
  if (parsed.status !== "OK") {
    throw new Error(`sunrise-sunset.org status ${parsed.status}`);
  }
  return {
    sunriseUtc: parsed.results.sunrise,
    sunsetUtc: parsed.results.sunset,
    solarNoonUtc: parsed.results.solar_noon,
    dayLengthSec: parsed.results.day_length,
  };
}
