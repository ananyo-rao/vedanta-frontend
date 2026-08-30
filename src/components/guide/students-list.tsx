"use client";

import Link from "next/link";
import { Loader2, MessageCircle, Users } from "lucide-react";
import { useGuideStudents } from "@/hooks/use-guide-students";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, formatVerse } from "@/lib/utils";

/**
 * The teacher's roster. This screen is also the notification list — students
 * with unanswered questions sort to the top and carry a count — so there is no
 * second inbox to keep in sync with it.
 */
export function StudentsList({ supervising = false }: { supervising?: boolean }) {
  const { data: students = [], isLoading, error } = useGuideStudents();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-8 text-center text-sm text-red-500">
        {error instanceof Error ? error.message : "Failed to load students."}
      </p>
    );
  }

  const waiting = students.filter((s) => s.unanswered_count > 0).length;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-on-surface">Students</h1>
        <p className="text-sm text-on-surface-variant">
          {students.length === 0
            ? supervising
            ? "No students have been assigned to a guide yet."
            : "No students are assigned to you yet."
            : waiting > 0
              ? `${waiting} of ${students.length} ${waiting === 1 ? "is" : "are"} waiting for a reply.`
              : `${students.length} ${students.length === 1 ? "student" : "students"}, all caught up.`}
        </p>
      </div>

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-low py-16 text-center text-on-surface-variant">
          <Users className="mb-2 h-8 w-8 opacity-40" />
          <p className="text-sm">
            {supervising
              ? "Assign guides to members from Admin → Users."
              : "An administrator assigns students to a guide. Yours will appear here."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {students.map((s) => (
            <li key={s.clerk_id}>
              <Link
                href={`/app/guide/students/${encodeURIComponent(s.clerk_id)}`}
                className="flex min-h-[44px] items-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-low px-4 py-3 transition-colors hover:bg-surface-container-high"
              >
                <span className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials(s.name || s.email)}
                  {s.unanswered_count > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface-container-low"
                    />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-on-surface">
                    {s.name || s.email}
                  </span>
                  <span className="block truncate text-xs text-on-surface-variant">
                    {s.verse
                      ? formatVerse(s.verse.chapter, s.verse.verse)
                      : "No verse marked"}
                    {s.last_message_at
                      ? ` · ${formatRelativeTime(s.last_message_at)}`
                      : ""}
                    {supervising && s.guide_name ? ` · ${s.guide_name}` : ""}
                  </span>
                </span>

                {s.unanswered_count > 0 && (
                  <Badge className="flex-shrink-0 gap-1 bg-primary px-2 py-0.5 text-[11px] text-white">
                    <MessageCircle className="h-3 w-3" />
                    {s.unanswered_count}
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
