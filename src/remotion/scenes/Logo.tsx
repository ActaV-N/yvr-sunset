import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { EASING, LOGO, TIMELINE, TIMING } from "../../brand/tokens";

/**
 * Persistent brand masthead. Top-left corner, fades in with the top bar
 * so the whole header element appears as one coordinated reveal.
 */
export function Logo(): React.JSX.Element {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [TIMELINE.topFrom, TIMELINE.topFrom + TIMING.softEntranceFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...EASING.soft),
    },
  );

  return (
    <div
      style={{
        position: "absolute",
        top: LOGO.topPx,
        left: LOGO.leftPx,
        width: LOGO.sizePx,
        height: LOGO.sizePx,
        opacity,
      }}
    >
      <Img
        src={staticFile(LOGO.src)}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
}
