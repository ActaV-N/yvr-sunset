export interface SunsetTimes {
  /** ISO 8601 UTC */
  sunriseUtc: string;
  /** ISO 8601 UTC */
  sunsetUtc: string;
  /** ISO 8601 UTC */
  solarNoonUtc: string;
  /** Day length in seconds */
  dayLengthSec: number;
}

export interface HourlyWeather {
  /** Time strings in local tz (America/Vancouver), e.g. "2026-06-21T20:00" */
  time: string[];
  /** Percent 0-100 */
  cloudCover: number[];
  cloudCoverLow: number[];
  cloudCoverMid: number[];
  cloudCoverHigh: number[];
  /** Meters */
  visibility: number[];
}

export interface SunsetSnapshot {
  /** Local date "YYYY-MM-DD" */
  date: string;
  times: SunsetTimes;
  hourly: HourlyWeather;
}
