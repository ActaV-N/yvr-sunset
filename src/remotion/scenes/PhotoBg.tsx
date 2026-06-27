import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, EASING } from "../../brand/tokens";

interface Props {
  photoFile: string | null;
}

/**
 * Background plate. Photo (when available) with linear Ken Burns, or a deep
 * dusk gradient. Always finished with: warm wash → vignette → bottom darken
 * to guarantee text legibility regardless of source photo brightness.
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

      {/* Bottom anchor: dark band so lower text remains punchy on any photo */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg,
            rgba(11, 11, 20, 0.45) 0%,
            rgba(11, 11, 20, 0.0) 22%,
            rgba(11, 11, 20, 0.0) 52%,
            rgba(11, 11, 20, 0.78) 100%)`,
        }}
      />
      {/* Soft vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
}

function DuskGradient(): React.JSX.Element {
  // Editorial "dusk" fallback when no photo is cached. Stays on-brand.
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
