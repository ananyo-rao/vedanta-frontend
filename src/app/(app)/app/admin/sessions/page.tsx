"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Radio,
  Trash2,
  Users,
  X,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MemberPicker } from "@/components/sessions/member-picker";
import { LiveRoom } from "@/components/sessions/live-room";
import { SessionPlayback } from "@/components/sessions/session-playback";
import {
  defaultWindow,
  useAllSessions,
  useCreateSeries,
  useDeleteSeries,
  useEndSession,
  useSessionSeries,
  useStartSession,
  useUpdateSeries,
  useNow,
} from "@/hooks/use-sessions";
import type {
  RoomToken,
  Session,
  SessionSeries,
} from "@/lib/api/dharma-sessions";

const WEEKDAYS = [
  { code: "MO", label: "Mon" },
  { code: "TU", label: "Tue" },
  { code: "WE", label: "Wed" },
  { code: "TH", label: "Thu" },
  { code: "FR", label: "Fri" },
  { code: "SA", label: "Sat" },
  { code: "SU", label: "Sun" },
];

const dateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});

const dayLabel = (rrule: string) =>
  WEEKDAYS.find((d) => rrule.includes(`BYDAY=${d.code}`))?.label ?? "Weekly";

/**
 * The admin console for live classes: define a weekly class, choose who is in
 * it, then start and end each sitting.
 */
export default function AdminSessionsPage() {
  const { from, to } = useMemo(() => defaultWindow(), []);
  const now = useNow();
  const { data: series = [], isLoading: seriesLoading } = useSessionSeries();
  const { data: sessions = [], isLoading: sessionsLoading } = useAllSessions(
    from,
    to
  );

  const [creating, setCreating] = useState(false);
  const [editingRoster, setEditingRoster] = useState<SessionSeries | null>(null);
  const [room, setRoom] = useState<{
    creds: RoomToken;
    title: string;
    id: string;
  } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const start = useStartSession();
  const end = useEndSession();
  const del = useDeleteSeries();

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

  const handleStart = async (s: Session) => {
    const creds = await start.mutateAsync(s.id);
    setRoom({ creds, title: s.title, id: s.id });
  };

  const handleEnd = async (id: string) => {
    await end.mutateAsync(id);
    setRoom(null);
  };

  if (room) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <LiveRoom
          credentials={room.creds}
          title={room.title}
          onLeave={() => setRoom(null)}
          actions={
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleEnd(room.id)}
              disabled={end.isPending}
            >
              {end.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              End for everyone
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Live Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Schedule classes, invite members, and run the room.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New class
        </Button>
      </header>

      {creating && <CreateSeriesForm onClose={() => setCreating(false)} />}
      {editingRoster && (
        <EditRosterForm
          series={editingRoster}
          onClose={() => setEditingRoster(null)}
        />
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
              <div className="flex items-center gap-2">
                <Badge className="gap-1">
                  <Radio className="h-3 w-3 animate-pulse" />
                  Live
                </Badge>
                <span className="font-medium">{s.title}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleStart(s)}>
                  Rejoin
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleEnd(s.id)}
                  disabled={end.isPending}
                >
                  End
                </Button>
              </div>
            </Card>
          ))}
        </section>
      )}

      {/* ── Classes ──────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Classes</h2>
        {seriesLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : series.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No classes yet. Create one to get started.
          </p>
        ) : (
          series.map((sr) => (
            <Card key={sr.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{sr.title}</p>
                <p className="text-xs text-muted-foreground">
                  {dayLabel(sr.rrule)} · {sr.start_time.slice(0, 5)} ·{" "}
                  {sr.duration_minutes} min · {sr.timezone}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingRoster(sr)}
              >
                <Users className="mr-2 h-4 w-4" />
                {sr.participants?.length ?? 0} invited
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Delete ${sr.title}`}
                onClick={() => {
                  if (
                    confirm(
                      `Delete "${sr.title}" and all its scheduled sittings?`
                    )
                  ) {
                    del.mutate(sr.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          ))
        )}
      </section>

      {/* ── Upcoming sittings ────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Upcoming</h2>
        {sessionsLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
        ) : (
          upcoming.slice(0, 10).map((s) => (
            <Card key={s.id} className="flex items-center gap-3 p-4">
              <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">
                  {dateFmt.format(new Date(s.scheduled_at))} ·{" "}
                  {timeFmt.format(new Date(s.scheduled_at))}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleStart(s)}
                disabled={start.isPending}
              >
                {start.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Start
              </Button>
            </Card>
          ))
        )}
        {start.isError && (
          <p className="text-sm text-destructive" role="alert">
            {start.error instanceof Error
              ? start.error.message
              : "Could not start the class."}
          </p>
        )}
      </section>

      {/* ── Past ─────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Past</h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet.</p>
        ) : (
          past.slice(0, 20).map((s) => {
            const isOpen = openId === s.id;
            return (
              <Card key={s.id} className="p-4">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {s.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {dateFmt.format(new Date(s.scheduled_at))}
                    </span>
                  </span>
                  {s.status === "processing" ? (
                    <Badge variant="secondary">Processing…</Badge>
                  ) : s.recording_gcs_path ? (
                    <Badge variant="outline">Recorded</Badge>
                  ) : (
                    <Badge variant="outline">No recording</Badge>
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

// ── Forms ───────────────────────────────────────────────────────────────────

function CreateSeriesForm({ onClose }: { onClose: () => void }) {
  const create = useCreateSeries();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [day, setDay] = useState("WE");
  const [startTime, setStartTime] = useState("07:00");
  const [duration, setDuration] = useState(60);
  const [participants, setParticipants] = useState<string[]>([]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      rrule: `FREQ=WEEKLY;BYDAY=${day}`,
      start_time: startTime,
      duration_minutes: duration,
      // The browser's zone is the one the admin just picked the time in.
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      participant_ids: participants,
    });
    onClose();
  };

  return (
    <Card className="p-4">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">New class</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Vedanta 101"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Repeats every</legend>
          <div className="flex flex-wrap gap-1">
            {WEEKDAYS.map((d) => (
              <Button
                key={d.code}
                type="button"
                size="sm"
                variant={day === d.code ? "default" : "outline"}
                onClick={() => setDay(d.code)}
                aria-pressed={day === d.code}
              >
                {d.label}
              </Button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start-time">Start time</Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={5}
              max={480}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Members</Label>
          <MemberPicker selected={participants} onChange={setParticipants} />
        </div>

        {create.isError && (
          <p className="text-sm text-destructive" role="alert">
            {create.error instanceof Error
              ? create.error.message
              : "Could not create the class."}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={create.isPending || !title.trim()}>
            {create.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create
          </Button>
        </div>
      </form>
    </Card>
  );
}

function EditRosterForm({
  series,
  onClose,
}: {
  series: SessionSeries;
  onClose: () => void;
}) {
  const update = useUpdateSeries();
  const [participants, setParticipants] = useState<string[]>(
    series.participants?.map((p) => p.clerk_id) ?? []
  );

  const save = async () => {
    await update.mutateAsync({
      id: series.id,
      input: { participant_ids: participants },
    });
    onClose();
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Members · {series.title}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <MemberPicker selected={participants} onChange={setParticipants} />

      {update.isError && (
        <p className="text-sm text-destructive" role="alert">
          {update.error instanceof Error
            ? update.error.message
            : "Could not save the roster."}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>
    </Card>
  );
}
