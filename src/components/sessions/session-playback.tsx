"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Play, FileText } from "lucide-react";
import { getRecordingUrl } from "@/lib/api/dharma-sessions";
import { useTranscript } from "@/hooks/use-sessions";
import { TranscriptView } from "./transcript-view";

/**
 * Recording playback and transcript for a finished class. Shown to anyone the
 * backend lets read it — an invited member or an admin.
 *
 * The audio URL is a short-lived signed GCS link, so it is fetched on mount
 * rather than stored.
 */
export function SessionPlayback({
  sessionId,
  durationSeconds,
  hasRecording,
}: {
  sessionId: string;
  durationSeconds?: number;
  hasRecording: boolean;
}) {
  const { getToken } = useAuth();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasRecording) return;
    let cancelled = false;

    (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const url = await getRecordingUrl(token, sessionId);
        if (!cancelled) setAudioUrl(url);
      } catch (err) {
        if (!cancelled) {
          setAudioError(
            err instanceof Error ? err.message : "Recording unavailable"
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, hasRecording, getToken]);

  const { data: transcript, isLoading: transcriptLoading } = useTranscript(
    sessionId,
    hasRecording
  );

  if (!hasRecording) {
    return (
      <p className="text-sm text-muted-foreground">
        This class was not recorded.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Play className="h-4 w-4" />
          Recording
          {durationSeconds != null && durationSeconds > 0 && (
            <span className="font-normal text-muted-foreground">
              {Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s
            </span>
          )}
        </h3>
        {audioUrl ? (
          <audio controls src={audioUrl} className="w-full" />
        ) : audioError ? (
          <p className="text-sm text-muted-foreground">{audioError}</p>
        ) : (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4" />
          Transcript
        </h3>
        {transcriptLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : transcript ? (
          <TranscriptView transcript={transcript} />
        ) : (
          <p className="text-sm text-muted-foreground">
            The transcript is still being generated.
          </p>
        )}
      </section>
    </div>
  );
}
