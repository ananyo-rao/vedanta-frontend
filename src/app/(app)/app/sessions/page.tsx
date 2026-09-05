"use client";

import { useMemo, useState } from "react";
import { Loader2, Radio, CalendarDays, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  defaultWindow,
  useMySessions,
  useJoinSession,
  useNow,
} from "@/hooks/use-sessions";
import type { RoomToken, Session } from "@/lib/api/dharma-sessions";
import { LiveRoom } from "@/components/sessions/live-room";
import { SessionPlayback } from "@/components/sessions/session-playback";

const dateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * A member's classes: what is live now, what is coming, and recordings of what
 * they missed. The list only ever contains classes they were invited to — the
 * backend scopes it to their own membership.
 */
export default function MySessionsPage() {
  // Stable across renders so the query key does not churn every second.
  const { from, to } = useMemo(() => defaultWindow(), []);
  const now = useNow();
  const { data: sessions = [], isLoading, isError } = useMySessions(from, to);

  const [room, setRoom] = useState<{ creds: RoomToken; title: string } | null>(
    null
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const join = useJoinSession();

  const { live, upcoming, past } = useMemo(() => {
    return {
      live: sessions.filter((s) => s.status === "live"),
      upcoming: sessions.filter(
        (s) =>
          s.status === "scheduled" && new Date(s.scheduled_at).getTime() >= now
      ),
      past: sessions
        .filter((s) => s.status === "completed" || s.status === "processing")
        .reverse(),
    };
  }, [sessions, now]);

  const handleJoin = async (s: Session) => {
    try {
      const creds = await join.mutateAsync(s.id);
      setRoom({ creds, title: s.title });
    } catch {
      // The mutation carries the message; surfaced below the button.
    }
  };

  if (room) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <LiveRoom
          credentials={room.creds}
          title={room.title}
          onLeave={() => setRoom(null)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="p-6 text-sm text-destructive">
        Could not load your classes. Please try again.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6">
      <header>
        <h1 className="text-xl font-semibold">Live Sessions</h1>
        <p className="text-sm text-muted-foreground">
          Classes you have been invited to.
        </p>
      </header>

      {join.isError && (
        <p className="text-sm text-destructive" role="alert">
          {join.error instanceof Error
            ? join.error.message
            : "Could not join the class."}
        </p>
      )}

      {live.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Happening now
          </h2>
          {live.map((s) => (
            <Card
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 border-primary/40 p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge className="gap-1">
                    <Radio className="h-3 w-3 animate-pulse" />
                    Live
                  </Badge>
                  <span className="truncate font-medium">{s.title}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Started {timeFmt.format(new Date(s.scheduled_at))}
                </p>
              </div>
              <Button
                onClick={() => handleJoin(s)}
                disabled={!s.can_join || join.isPending}
              >
                {join.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {s.can_join ? "Join" : "Closed"}
              </Button>
            </Card>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No classes scheduled.
          </p>
        ) : (
          upcoming.map((s) => (
            <Card key={s.id} className="flex items-center gap-3 p-4">
              <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">
                  {dateFmt.format(new Date(s.scheduled_at))} ·{" "}
                  {timeFmt.format(new Date(s.scheduled_at))}
                  {s.duration_minutes ? ` · ${s.duration_minutes} min` : ""}
                </p>
              </div>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Past classes
        </h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet.</p>
        ) : (
          past.map((s) => {
            const isOpen = openId === s.id;
            return (
              <Card key={s.id} className="p-4">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-90" : ""
                    }`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {s.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {dateFmt.format(new Date(s.scheduled_at))}
                    </span>
                  </span>
                  {s.status === "processing" && (
                    <Badge variant="secondary">Processing…</Badge>
                  )}
                </button>

                {isOpen && (
                  <div className="mt-4 border-t pt-4">
                    <SessionPlayback
                      sessionId={s.id}
                      durationSeconds={s.recording_duration_seconds}
                      hasRecording={!!s.recording_gcs_path}
                    />
                  </div>
                )}
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}
