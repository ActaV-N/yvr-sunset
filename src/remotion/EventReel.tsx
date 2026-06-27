import { AbsoluteFill } from "remotion";
import { FONTS } from "../brand/fonts";
import { COLORS } from "../brand/tokens";
import type { EventReelProps } from "./event-types";
import { Attribution } from "./scenes/Attribution";
import { AudioTrack } from "./scenes/AudioTrack";
import { EventHero } from "./scenes/EventHero";
import { EventMeta } from "./scenes/EventMeta";
import { EventTopBar } from "./scenes/EventTopBar";
import { Logo } from "./scenes/Logo";
import { PhotoBg } from "./scenes/PhotoBg";

export function EventReel(props: EventReelProps): React.JSX.Element {
  return (
    <AbsoluteFill
      style={{
        fontFamily: FONTS.ui,
        background: COLORS.midnightInk,
        color: COLORS.daylightCream,
      }}
    >
      <PhotoBg photoFile={props.photoFile} />
      <Logo />
      <EventTopBar dateLabel={props.dateLabel} timeLabel={props.timeLabel} />
      <EventHero eventName={props.eventName} categoryLabel={props.categoryLabel} />
      <EventMeta venueName={props.venueName} priceLabel={props.priceLabel} />
      <Attribution text="🎟 via Ticketmaster" />
      <AudioTrack audioFile={props.audioFile} />
    </AbsoluteFill>
  );
}
