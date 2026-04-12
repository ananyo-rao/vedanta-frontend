"use client";

import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { useAdminCourses } from "@/hooks/use-courses-admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function AdminCourseList() {
  const { data: courses, isLoading, error } = useAdminCourses();

  if (error) {
    return (
      <div className="rounded-xl bg-error-container p-6 text-center">
        <p className="text-sm font-medium text-on-error-container">
          {error instanceof Error ? error.message : "Failed to load courses"}
        </p>
      </div>
    );
  }

  if (isLoading || courses == null) {
    return (
      <div className="py-16 text-center text-sm text-on-surface-variant">
        Loading courses...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">
            Course Builder
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage your courses
          </p>
        </div>
        <Button asChild>
          <Link href="/app/admin/course-builder/new" aria-label="Create new course">
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Link>
        </Button>
      </div>

      {/* Course list */}
      {!courses || courses.length === 0 ? (
        <AdminCourseEmptyState />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 sm:hidden">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/app/admin/course-builder/${course.id}`}
                className="block rounded-xl bg-surface-container-low p-4 transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:bg-surface-container-high"
              >
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="flex-1 font-serif text-base font-bold text-on-surface">
                    {course.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={course.status} />
                  {course.end_date && (
                    <Badge
                      variant="outline"
                      className="border-amber-200 bg-amber-50 text-amber-700"
                    >
                      Ending {format(new Date(course.end_date), "MMM d")}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">
                  {course.page_count} pages &middot;{" "}
                  {course.status === "published"
                    ? `${course.enrollment_count} enrolled`
                    : "--"}
                </p>
              </Link>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden overflow-x-auto rounded-lg border border-outline-variant/10 sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                  <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                    Pages
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                    Students
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-outline-variant/5 hover:bg-surface-container-low/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/app/admin/course-builder/${course.id}`}
                        className="font-medium text-on-surface hover:text-primary"
                      >
                        {course.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={course.status} />
                        {course.end_date && (
                          <Badge
                            variant="outline"
                            className="border-amber-200 bg-amber-50 text-amber-700"
                          >
                            Ending{" "}
                            {format(new Date(course.end_date), "MMM d")}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {course.page_count}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {course.status === "published"
                        ? course.enrollment_count
                        : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 text-emerald-700"
      >
        Published
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-on-surface-variant">
      Draft
    </Badge>
  );
}

function AdminCourseEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
        <BookOpen className="h-8 w-8 text-on-surface-variant" />
      </div>
      <h3 className="mb-2 font-serif text-xl font-bold text-on-surface">
        No courses yet
      </h3>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-on-surface-variant">
        Create your first course to begin teaching.
      </p>
      <Button asChild>
        <Link href="/app/admin/course-builder/new" aria-label="Create your first course">
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Link>
      </Button>
    </div>
  );
}
