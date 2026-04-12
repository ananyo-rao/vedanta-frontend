"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCourseProgress } from "@/hooks/use-courses";

/**
 * Redirect page for /app/courses/[courseId]/pages
 * Finds the current (first uncompleted) page and redirects to it.
 * If not enrolled or no pages, redirects to the course intro.
 */
export default function CoursePlayerRedirect() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { data: progress, isLoading, isError } = useCourseProgress(courseId);

  useEffect(() => {
    if (isLoading) return;

    // If error (not enrolled, etc.), go to course intro page
    if (isError || !progress) {
      router.replace(`/app/courses/${courseId}`);
      return;
    }

    const pages = progress.page_statuses;
    if (!pages || pages.length === 0) {
      router.replace(`/app/courses/${courseId}`);
      return;
    }

    // Find the current page (first non-completed page)
    const currentPage = pages.find(
      (p) => p.status === "current" || p.status === "unlocked"
    );
    const targetPageId = currentPage?.page_id || pages[0].page_id;
    router.replace(`/app/courses/${courseId}/pages/${targetPageId}`);
  }, [progress, isLoading, isError, courseId, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-sm text-on-surface-variant">Loading course...</p>
    </div>
  );
}
