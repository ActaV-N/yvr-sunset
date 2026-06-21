import { config } from "../config";
import { fetchHourlyWeather } from "./open-meteo";
import { fetchSunsetTimes } from "./sunrise-sunset";
import type { SunsetSnapshot } from "./types";

/** Format a Date as "YYYY-MM-DD" in the configured timezone. */
export function localDateISO(d: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: config.tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d);
}

export async function fetchSunsetSnapshot(dateISO: string): Promise<SunsetSnapshot> {
  const [times, hourly] = await Promise.all([
    fetchSunsetTimes(dateISO, config.lat, config.lng),
    fetchHourlyWeather(dateISO, config.lat, config.lng, config.tz),
  ]);
  return { date: dateISO, times, hourly };
}
