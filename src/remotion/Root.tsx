import { Composition } from "remotion";
import {
  DEFAULT_EVENT_REEL_PROPS,
  EVENT_REEL_FPS,
  EVENT_REEL_FRAMES,
  EVENT_REEL_HEIGHT,
  EVENT_REEL_WIDTH,
  EventReelPropsSchema,
} from "./event-types";
import { EventReel } from "./EventReel";
import { SunsetReel } from "./SunsetReel";
import {
  DEFAULT_REEL_PROPS,
  REEL_FPS,
  REEL_FRAMES,
  REEL_HEIGHT,
  REEL_WIDTH,
  ReelPropsSchema,
} from "./types";

export const SUNSET_COMPOSITION_ID = "SunsetReel";
export const EVENT_COMPOSITION_ID = "EventReel";

/** Back-compat alias for callers that pre-dated the event composition. */
export const COMPOSITION_ID = SUNSET_COMPOSITION_ID;

export function RemotionRoot(): React.JSX.Element {
  return (
    <>
      <Composition
        id={SUNSET_COMPOSITION_ID}
        component={SunsetReel}
        durationInFrames={REEL_FRAMES}
        fps={REEL_FPS}
        width={REEL_WIDTH}
        height={REEL_HEIGHT}
        schema={ReelPropsSchema}
        defaultProps={DEFAULT_REEL_PROPS}
      />
      <Composition
        id={EVENT_COMPOSITION_ID}
        component={EventReel}
        durationInFrames={EVENT_REEL_FRAMES}
        fps={EVENT_REEL_FPS}
        width={EVENT_REEL_WIDTH}
        height={EVENT_REEL_HEIGHT}
        schema={EventReelPropsSchema}
        defaultProps={DEFAULT_EVENT_REEL_PROPS}
      />
    </>
  );
}
