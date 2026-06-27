import { Audio } from "remotion";

/**
 * Per-scene TTS audio. Volume kept near-max — BGM is mixed at lower volume
 * at the composition level so no ducking needed here.
 *
 * Accepts a full https URL (Remotion Chromium fetches at render).
 */
export function SceneVoice({ voiceFile }: { voiceFile: string }): React.JSX.Element {
  return <Audio src={voiceFile} volume={0.95} />;
}
