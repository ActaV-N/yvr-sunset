import { AbsoluteFill, Sequence } from "remotion";
import { FONTS } from "../brand/fonts";
import { COLORS } from "../brand/tokens";
import type { BriefingReelProps } from "./briefing-types";
import { AudioTrack } from "./scenes/AudioTrack";
import { BriefingIntro } from "./scenes/briefing/BriefingIntro";
import { BriefingOutro } from "./scenes/briefing/BriefingOutro";
import { EventCardScene } from "./scenes/briefing/EventCardScene";
import { SceneVoice } from "./scenes/briefing/SceneVoice";
import { Subtitle } from "./scenes/briefing/Subtitle";
import { SunsetWeekScene } from "./scenes/briefing/SunsetWeekScene";
import { Logo } from "./scenes/Logo";

export function BriefingReel(props: BriefingReelProps): React.JSX.Element {
  const { scenes } = props;

  // Compute cumulative scene start frames.
  let cursor = 0;
  const introStart = cursor;
  cursor += scenes.intro.durationFrames;
  const sunsetStart = cursor;
  if (scenes.sunsetWeek) cursor += scenes.sunsetWeek.durationFrames;
  const eventStarts: number[] = [];
  for (const e of scenes.events) {
    eventStarts.push(cursor);
    cursor += e.durationFrames;
  }
  const outroStart = cursor;

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONTS.ui,
        background: COLORS.midnightInk,
        color: COLORS.daylightCream,
      }}
    >
      {/* Intro */}
      <Sequence from={introStart} durationInFrames={scenes.intro.durationFrames}>
        <BriefingIntro weekLabel={props.weekLabel} />
        <Subtitle text={scenes.intro.subtitleKR} />
        <SceneVoice voiceFile={scenes.intro.voiceFile} />
      </Sequence>

      {/* Sunset week */}
      {scenes.sunsetWeek ? (
        <Sequence
          from={sunsetStart}
          durationInFrames={scenes.sunsetWeek.durationFrames}
        >
          <SunsetWeekScene
            photoFile={scenes.sunsetWeek.photoFile}
            dateLabelEn={scenes.sunsetWeek.dateLabelEn}
            score={scenes.sunsetWeek.score}
            spotName={scenes.sunsetWeek.spotName}
          />
          <Subtitle text={scenes.sunsetWeek.subtitleKR} />
          <SceneVoice voiceFile={scenes.sunsetWeek.voiceFile} />
        </Sequence>
      ) : null}

      {/* Event cards */}
      {scenes.events.map((event, i) => (
        <Sequence
          key={`event-${i}`}
          from={eventStarts[i]!}
          durationInFrames={event.durationFrames}
        >
          <EventCardScene
            photoFile={event.photoFile}
            eventName={event.eventName}
            venueName={event.venueName}
            dateLabelEn={event.dateLabelEn}
          />
          <Subtitle text={event.subtitleKR} />
          <SceneVoice voiceFile={event.voiceFile} />
        </Sequence>
      ))}

      {/* Outro */}
      <Sequence from={outroStart} durationInFrames={scenes.outro.durationFrames}>
        <BriefingOutro />
        <Subtitle text={scenes.outro.subtitleKR} />
        <SceneVoice voiceFile={scenes.outro.voiceFile} />
      </Sequence>

      {/* Persistent logo across all scenes */}
      <Logo />

      {/* BGM under voice (low volume, full length) */}
      <AudioTrack audioFile={props.bgmFile} />
    </AbsoluteFill>
  );
}
