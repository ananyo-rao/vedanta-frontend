"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePageContent, useCourseProgress } from "@/hooks/use-courses";
import { VideoPage } from "@/components/course/video-page";
import { IntrospectionPage } from "@/components/course/introspection-page";
import { MeditationPage } from "@/components/course/meditation-page";
import type { CoursePage, IntrospectionResponse } from "@/types/course";

// The hook flattens { page: CoursePage, completion, video_progress, introspection_response } into one object
type PageData = CoursePage & {
  completion?: { id: string; completed_at: string } | null;
  video_progress?: { progress_percent: number; last_position: number } | null;
  introspection_response?: IntrospectionResponse | null;
};

interface CoursePageContentProps {
  courseId: string;
  pageId: string;
}

export function CoursePageContent({ courseId, pageId }: CoursePageContentProps) {
  const router = useRouter();
  const { data: pageData, isLoading: pageLoading, error: pageError } = usePageContent(courseId, pageId);
  const { data: progress, isLoading: progressLoading } = useCourseProgress(courseId);

  // Redirect if page is locked
  useEffect(() => {
    if (!progress || !pageId) return;

    const pageProgress = progress.page_statuses.find((p) => p.page_id === pageId);
    if (pageProgress?.status === "locked") {
      // Find the current page (first non-completed, non-locked page)
      const currentPage = progress.page_statuses.find(
        (p) => p.status === "current" || p.status === "unlocked"
      );
      if (currentPage) {
        toast.info(
          "That page is not yet available. Continue from where you left off."
        );
        router.replace(`/app/courses/${courseId}/pages/${currentPage.page_id}`);
      }
    }
  }, [progress, pageId, courseId, router]);

  if (pageLoading || progressLoading) {
    return (
      <div className="py-16 text-center text-sm text-on-surface-variant">
        Loading...
      </div>
    );
  }

  if (pageError || !pageData) {
    return (
      <div className="rounded-xl bg-error-container p-6 text-center">
        <p className="text-sm font-medium text-on-error-container">
          {pageError instanceof Error
            ? pageError.message
            : "Page not found"}
        </p>
      </div>
    );
  }

  if (!progress) return null;

  const currentIndex = progress.page_statuses.findIndex((p) => p.page_id === pageId);
  const pageStatus = progress.page_statuses[currentIndex]?.status || "current";
  const nextPage =
    currentIndex < progress.page_statuses.length - 1
      ? progress.page_statuses[currentIndex + 1]
      : null;
  const isLastPage = currentIndex === progress.page_statuses.length - 1;

  // Find next navigable page (skip locked pages for the "continue" button)
  const nextPageId = nextPage ? nextPage.page_id : null;

  const page = pageData as PageData;

  switch (page.page_type) {
    case "video":
      return (
        <VideoPage
          page={page}
          courseId={courseId}
          nextPageId={nextPageId}
          isLastPage={isLastPage}
          pageStatus={pageStatus}
        />
      );
    case "introspection":
      return (
        <IntrospectionPage
          page={page}
          courseId={courseId}
          nextPageId={nextPageId}
          isLastPage={isLastPage}
          pageStatus={pageStatus}
        />
      );
    case "meditation":
      return (
        <MeditationPage
          page={page}
          courseId={courseId}
          nextPageId={nextPageId}
          isLastPage={isLastPage}
          pageStatus={pageStatus}
        />
      );
    default:
      return (
        <div className="py-16 text-center text-sm text-on-surface-variant">
          Unknown page type
        </div>
      );
  }
}
