"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useStudent } from "@/hooks/use-guide-students";
import { StudentThread } from "./student-thread";
import { StudentNoteEditor } from "./student-note-editor";
import { VerseMarkerForm } from "./verse-marker-form";

/**
 * One student: what they have asked on the left, who they are on the right.
 * Both halves are the guide's working surface, so neither is hidden behind a tab.
 */
export function StudentDetailView({ clerkId }: { clerkId: string }) {
  const { data: student, isLoading, error } = useStudent(clerkId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-red-500">
          {error instanceof Error ? error.message : "Student not found."}
        </p>
        <Link
          href="/app/guide/students"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          Back to students
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/app/guide/students"
        className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" />
        All students
      </Link>

      <header className="mb-5">
        <h1 className="text-lg font-semibold text-on-surface">
          {student.name || student.email}
        </h1>
        <p className="text-sm text-on-surface-variant">{student.email}</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex min-h-[28rem] flex-col">
          <h2 className="mb-2 text-sm font-semibold text-on-surface">
            Their questions
          </h2>
          <StudentThread clerkId={clerkId} />
        </div>

        <div className="space-y-4">
          <StudentNoteEditor clerkId={clerkId} note={student.note} />
          <VerseMarkerForm clerkId={clerkId} verse={student.verse} />
        </div>
      </div>
    </div>
  );
}
