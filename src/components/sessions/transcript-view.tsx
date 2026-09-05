"use client";

import { useMemo } from "react";
import type { TranscriptData } from "@/lib/api/dharma-sessions";
import { cn } from "@/lib/utils";

const speakerColors = [
  "text-amber-600 dark:text-amber-400",
  "text-cyan-600 dark:text-cyan-400",
  "text-violet-600 dark:text-violet-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-rose-600 dark:text-rose-400",
  "text-blue-600 dark:text-blue-400",
];

function timestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Deepgram returns a flat word list tagged with a speaker. Group consecutive
 * words by speaker so it reads as a conversation rather than a word soup.
 */
export function TranscriptView({ transcript }: { transcript: TranscriptData }) {
  const paragraphs = useMemo(() => {
    const words =
      transcript?.results?.channels?.[0]?.alternatives?.[0]?.words ?? [];
    if (words.length === 0) return [];

    const out: Array<{ speaker: number; start: number; text: string }> = [];
    let current = {
      speaker: words[0].speaker,
      start: words[0].start,
      words: [words[0].word],
    };
    for (let i = 1; i < words.length; i++) {
      if (words[i].speaker !== current.speaker) {
        out.push({
          speaker: current.speaker,
          start: current.start,
          text: current.words.join(" "),
        });
        current = {
          speaker: words[i].speaker,
          start: words[i].start,
          words: [words[i].word],
        };
      } else {
        current.words.push(words[i].word);
      }
    }
    out.push({
      speaker: current.speaker,
      start: current.start,
      text: current.words.join(" "),
    });
    return out;
  }, [transcript]);

  if (paragraphs.length === 0) {
    // A recording with no speech still produces a valid, empty transcript.
    return (
      <p className="text-sm text-muted-foreground">
        No speech was detected in this recording.
      </p>
    );
  }

  return (
    <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-2">
      {paragraphs.map((p, i) => (
        <div key={`${p.start}-${i}`} className="flex gap-3">
          <div className="w-20 shrink-0 pt-0.5">
            <span
              className={cn(
                "text-xs font-medium",
                speakerColors[p.speaker % speakerColors.length]
              )}
            >
              Speaker {p.speaker + 1}
            </span>
            <p className="text-[10px] text-muted-foreground">
              {timestamp(p.start)}
            </p>
          </div>
          <p className="flex-1 text-sm leading-relaxed">{p.text}</p>
        </div>
      ))}
    </div>
  );
}
