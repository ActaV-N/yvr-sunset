import { Composition } from "remotion";
import { SunsetReel } from "./SunsetReel";
import {
  DEFAULT_REEL_PROPS,
  REEL_FPS,
  REEL_FRAMES,
  REEL_HEIGHT,
  REEL_WIDTH,
  ReelPropsSchema,
} from "./types";

export const COMPOSITION_ID = "SunsetReel";

export function RemotionRoot(): React.JSX.Element {
  return (
    <Composition
      id={COMPOSITION_ID}
      component={SunsetReel}
      durationInFrames={REEL_FRAMES}
      fps={REEL_FPS}
      width={REEL_WIDTH}
      height={REEL_HEIGHT}
      schema={ReelPropsSchema}
      defaultProps={DEFAULT_REEL_PROPS}
    />
  );
}
