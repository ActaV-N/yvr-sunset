import { Audio, staticFile } from "remotion";

/**
 * Per-scene voice audio. Volume kept at near-max — BGM is mixed at low volume
 * at the composition level so we don't need to duck here.
 */
export function SceneVoice({ voiceFile }: { voiceFile: string }): React.JSX.Element {
  return <Audio src={staticFile(voiceFile)} volume={0.95} />;
}
