// Pre-download Chrome Headless Shell at build time so Railway cron ticks
// don't re-download ~93MB on every run. Called by nixpacks.toml build phase.

import { ensureBrowser } from "@remotion/renderer";

await ensureBrowser({ chromeMode: "headless-shell" });
console.log("✅ Chrome Headless Shell ready");
