"use client";

import { useState } from "react";
import { VideoPlayer } from "@/components/course/video-player";
import { CompleteAndContinue } from "@/components/course/complete-and-continue";
import type { CoursePage, MeditationContent, PageStatus } from "@/types/course";

interface MeditationPageProps {
  page: CoursePage & {
    video_progress?: { progress_percent: number; last_position: number } | null;
  };
  courseId: string;
  nextPageId: string | null;
  isLastPage: boolean;
  pageStatus: PageStatus["status"];
}

export function MeditationPage({
  page,
  courseId,
  nextPageId,
  isLastPage,
  pageStatus,
}: MeditationPageProps) {
  const content = page.content as MeditationContent;
  const isCompleted = pageStatus === "completed";
  const [watchPercent, setWatchPercent] = useState(
    page.video_progress?.progress_percent || 0
  );
  const canComplete = watchPercent >= 90 || !page.is_strict;

  return (
    <div className="mx-auto max-w-2xl py-6 text-center sm:py-10">
      <h1 className="mb-4 font-serif text-2xl font-bold text-on-surface sm:text-3xl">
        {page.title}
      </h1>

      {content.description && (
        <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-on-surface-variant">
          {content.description}
        </p>
      )}

      {!content.description && <div className="mb-10" />}

      <div className="mb-10">
        <VideoPlayer
          url={content.video_url}
          courseId={courseId}
          pageId={page.id}
          initialPosition={page.video_progress?.last_position || 0}
          onProgressUpdate={setWatchPercent}
        />
      </div>

      <CompleteAndContinue
        courseId={courseId}
        pageId={page.id}
        nextPageId={nextPageId}
        isStrict={page.is_strict}
        canComplete={canComplete}
        isAlreadyCompleted={isCompleted}
        isLastPage={isLastPage}
        progressHint={
          page.is_strict && !canComplete
            ? `Watch to continue (${watchPercent}%)`
            : undefined
        }
      />
    </div>
  );
}
