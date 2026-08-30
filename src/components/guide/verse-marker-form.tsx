"use client";

import { useEffect, useState } from "react";
import { BookMarked, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveVerseMarker } from "@/hooks/use-guide-students";
import { formatVerse } from "@/lib/utils";
import type { VerseMarker } from "@/lib/api/dharma-guide";

/**
 * Where the student has been taken to in the Bhagavad Gita.
 *
 * This is not a display preference: it caps what the AI guide may draw on when
 * answering this student, so they are never handed a teaching from a chapter
 * they have not reached.
 */
export function VerseMarkerForm({
  clerkId,
  verse,
}: {
  clerkId: string;
  verse: VerseMarker | null;
}) {
  const save = useSaveVerseMarker(clerkId);
  const [chapter, setChapter] = useState(verse ? String(verse.chapter) : "");
  const [verseNo, setVerseNo] = useState(verse ? String(verse.verse) : "");
  const [error, setError] = useState<string | null>(null);

  // Adopt whatever is stored once a save settles, without clobbering typing.
  useEffect(() => {
    if (save.isPending) return;
    setChapter(verse ? String(verse.chapter) : "");
    setVerseNo(verse ? String(verse.verse) : "");
  }, [verse, save.isPending]);

  const c = Number(chapter);
  const v = Number(verseNo);
  const valid =
    Number.isInteger(c) && c >= 1 && Number.isInteger(v) && v >= 1;
  const changed = !verse || c !== verse.chapter || v !== verse.verse;

  const handleSave = () => {
    if (!valid || save.isPending) return;
    setError(null);
    save.mutate(
      { chapter: c, verse: v },
      {
        onError: (e) =>
          setError(e instanceof Error ? e.message : "Failed to save position"),
      }
    );
  };

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
      <header className="mb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-on-surface">
          <BookMarked className="h-4 w-4 text-primary" />
          Where they are
        </h2>
        <p className="text-xs text-on-surface-variant">
          {verse
            ? `Currently at ${formatVerse(verse.chapter, verse.verse)} of the Bhagavad Gita.`
            : "Not marked yet — until you set this, answers may draw on any teaching."}
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-24">
          <Label htmlFor="verse-chapter" className="text-xs">
            Chapter
          </Label>
          <Input
            id="verse-chapter"
            inputMode="numeric"
            value={chapter}
            onChange={(e) => setChapter(e.target.value.replace(/\D/g, ""))}
            placeholder="2"
          />
        </div>
        <div className="w-24">
          <Label htmlFor="verse-number" className="text-xs">
            Verse
          </Label>
          <Input
            id="verse-number"
            inputMode="numeric"
            value={verseNo}
            onChange={(e) => setVerseNo(e.target.value.replace(/\D/g, ""))}
            placeholder="47"
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={!valid || !changed || save.isPending}
        >
          {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save position
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <p className="mt-3 text-xs text-on-surface-variant">
        Their AI guide will answer only from teachings at or before this verse.
        General teachings that belong to no particular verse remain available.
      </p>
    </section>
  );
}
