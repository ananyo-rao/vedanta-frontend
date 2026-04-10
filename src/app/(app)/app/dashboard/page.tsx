"use client";

import { CourseGrid } from "@/components/dashboard/course-grid";
import { EmptyState } from "@/components/dashboard/empty-state";
import { useStudentCourses } from "@/hooks/use-courses";

export default function DashboardPage() {
  const { data: courses, isLoading, error } = useStudentCourses();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-on-surface">
          Courses
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Browse your available courses
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-on-surface-variant">
          Loading courses...
        </div>
      ) : error ? (
        <div className="rounded-xl bg-error-container p-6 text-center">
          <p className="text-sm font-medium text-on-error-container">
            {error instanceof Error ? error.message : "Failed to load courses"}
          </p>
        </div>
      ) : courses && courses.length > 0 ? (
        <CourseGrid courses={courses} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
