"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  AudioConference,
  RoomAudioRenderer,
  useParticipants,
  useConnectionState,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import "@livekit/components-styles";
import { Clock, Users, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RoomToken } from "@/lib/api/dharma-sessions";

interface Props {
  credentials: RoomToken;
  title: string;
  /** Rendered in the header — the admin's End button, when they have one. */
  actions?: React.ReactNode;
  /** Fired when the room closes, including when an admin ends the class. */
  onLeave: () => void;
}

/**
 * The audio room. Audio-only by design: these are lecture-style classes, and
 * video would cost bandwidth nobody is using.
 *
 * When an admin ends the class the server deletes the room, LiveKit disconnects
 * everyone, and onDisconnected fires here — which is what makes "end drops the
 * members" true for people who are still connected.
 */
export function LiveRoom({ credentials, title, actions, onLeave }: Props) {
  return (
    <LiveKitRoom
      token={credentials.token}
      serverUrl={credentials.url}
      connect
      audio
      video={false}
      onDisconnected={onLeave}
      className="flex h-full flex-col"
    >
      <RoomHeader title={title} actions={actions} onLeave={onLeave} />
      <div className="flex-1 p-4">
        <AudioConference />
      </div>
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function RoomHeader({
  title,
  actions,
  onLeave,
}: {
  title: string;
  actions?: React.ReactNode;
  onLeave: () => void;
}) {
  const participants = useParticipants();
  const state = useConnectionState();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (state !== ConnectionState.Connected) return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [state]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const connected = state === ConnectionState.Connected;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Badge
          variant={connected ? "default" : "secondary"}
          className="shrink-0 gap-1.5"
        >
          <Radio className={connected ? "h-3 w-3 animate-pulse" : "h-3 w-3"} />
          {connected ? "Live" : "Connecting…"}
        </Badge>
        <h1 className="truncate text-sm font-medium">{title}</h1>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {participants.length}
        </span>
        <span className="flex items-center gap-1.5 tabular-nums">
          <Clock className="h-4 w-4" />
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
        {actions}
        <Button variant="outline" size="sm" onClick={onLeave}>
          Leave
        </Button>
      </div>
    </header>
  );
}
