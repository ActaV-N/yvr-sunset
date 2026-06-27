import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, EASING, PHOTO_OVERLAY } from "../../brand/tokens";

interface Props {
  photoFile: string | null;
}

/**
 * Background plate with three-layer legibility treatment (see brand/tokens.ts
 * PHOTO_OVERLAY):
 *   1. CSS filter on the photo itself — slight desat + brightness down + contrast bump
 *   2. Top + bottom scrim gradients — dark bands behind text zones, center stays vivid
 *   3. Subtle radial vignette
 *
 * Edge-to-edge — IG safe area handled by content components, not here.
 */
export function PhotoBg({ photoFile }: Props): React.JSX.Element {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.14], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, durationInFrames], [0, -32], {
    extrapolateRight: "clamp",
  });
  const photoOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EASING.inOut),
  });

  return (
    <AbsoluteFill style={{ background: COLORS.midnightInk, overflow: "hidden" }}>
      {photoFile ? (
        <AbsoluteFill
          style={{
            transform: `scale(${scale}) translateY(${translateY}px)`,
            opacity: photoOpacity,
            filter: PHOTO_OVERLAY.photoFilter,
          }}
        >
          <Img
            src={photoFile.startsWith("http") ? photoFile : staticFile(photoFile)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      ) : (
        <DuskGradient />
      )}

      {/* Top scrim — protects logo + TopBar legibility */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg,
            rgba(11, 11, 20, ${PHOTO_OVERLAY.topScrimAlpha}) 0%,
            rgba(11, 11, 20, 0) 30%)`,
        }}
      />
      {/* Bottom scrim — protects hero center + chips */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg,
            rgba(11, 11, 20, 0) 55%,
            rgba(11, 11, 20, ${PHOTO_OVERLAY.bottomScrimAlpha}) 100%)`,
        }}
      />
      {/* Radial vignette — gentle edge falloff */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${PHOTO_OVERLAY.vignetteAlpha}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
}

function DuskGradient(): React.JSX.Element {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg,
          ${COLORS.midnightInk} 0%,
          #2a1b3d 30%,
          #6b2c3a 60%,
          ${COLORS.sunsetOrange} 92%,
          ${COLORS.goldenHour} 100%)`,
      }}
    />
  );
}
