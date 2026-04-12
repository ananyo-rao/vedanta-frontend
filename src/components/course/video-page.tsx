"use client";

import { useState } from "react";
import { VideoPlayer } from "@/components/course/video-player";
import { CompleteAndContinue } from "@/components/course/complete-and-continue";
import type { CoursePage, VideoContent, PageStatus } from "@/types/course";

interface VideoPageProps {
  page: CoursePage & {
    video_progress?: { progress_percent: number; last_position: number } | null;
  };
  courseId: string;
  nextPageId: string | null;
  isLastPage: boolean;
  pageStatus: PageStatus["status"];
}

export function VideoPage({
  page,
  courseId,
  nextPageId,
  isLastPage,
  pageStatus,
}: VideoPageProps) {
  const content = page.content as VideoContent;
  const isCompleted = pageStatus === "completed";
  const [watchPercent, setWatchPercent] = useState(
    page.video_progress?.progress_percent || 0
  );
  const canComplete = watchPercent >= 90 || !page.is_strict;

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-on-surface">
        {page.title}
      </h1>

      <div className="mb-8">
        <VideoPlayer
          url={content.video_url}
          courseId={courseId}
          pageId={page.id}
          initialPosition={page.video_progress?.last_position || 0}
          onProgressUpdate={setWatchPercent}
        />
      </div>

      <div className="mb-8 text-base leading-relaxed text-on-surface-variant">
        {content.summary}
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
