"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  if (content.audio_url) {
    return (
      <AudioMeditationPage
        page={page}
        courseId={courseId}
        nextPageId={nextPageId}
        isLastPage={isLastPage}
        isCompleted={isCompleted}
        content={content}
      />
    );
  }

  // Legacy: video-based meditation
  return (
    <VideoMeditationPage
      page={page}
      courseId={courseId}
      nextPageId={nextPageId}
      isLastPage={isLastPage}
      isCompleted={isCompleted}
      content={content}
    />
  );
}

// ─── Audio meditation (new) ────────────────────────────────────────────────────

interface InnerProps {
  page: MeditationPageProps["page"];
  courseId: string;
  nextPageId: string | null;
  isLastPage: boolean;
  isCompleted: boolean;
  content: MeditationContent;
}

function AudioMeditationPage({
  page,
  courseId,
  nextPageId,
  isLastPage,
  isCompleted,
  content,
}: InnerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // Track the highest listen percent reached (only ever increases)
  const [listenPercent, setListenPercent] = useState(0);

  const canComplete = listenPercent >= 90 || !page.is_strict;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
  };

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setCurrentTime(audio.currentTime);
    const pct = Math.floor((audio.currentTime / audio.duration) * 100);
    setListenPercent((prev) => Math.max(prev, pct));
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = (Number(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setListenPercent(100);
    };
    const onLoaded = () => setDuration(audio.duration || 0);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [handleTimeUpdate]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mx-auto max-w-xl py-6 text-center sm:py-10">
      <h1 className="mb-4 font-serif text-2xl font-bold text-on-surface sm:text-3xl">
        {page.title}
      </h1>

      {content.description && (
        <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-on-surface-variant">
          {content.description}
        </p>
      )}

      {/* Meditation area: Dakshinamurthy watermark + audio player */}
      <div className="relative mb-10 flex min-h-[300px] items-center justify-center sm:min-h-[360px]">
        {/* Watermark — decorative, hidden from assistive tech */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div className="relative h-72 w-72 opacity-[0.12] sm:h-80 sm:w-80">
            <Image
              src="/images/dakshinamurthy.png"
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Audio player card */}
        <div className="relative z-10 w-full max-w-sm rounded-2xl bg-surface-container px-6 py-7 shadow-sm">
          {/* Hidden native audio element */}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio ref={audioRef} src={content.audio_url} preload="metadata" />

          {/* Progress bar */}
          <div className="mb-5">
            <input
              type="range"
              min={0}
              max={100}
              value={progressPercent}
              onChange={handleSeek}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-outline-variant accent-primary"
              aria-label="Audio seek"
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-on-surface-variant">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={handleRestart}
              aria-label="Restart from beginning"
            >
              <RotateCcw className="h-5 w-5 text-on-surface-variant" />
            </Button>

            <Button
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="ml-0.5 h-6 w-6" />
              )}
            </Button>

            {/* Spacer to balance the restart button */}
            <div className="h-10 w-10" aria-hidden />
          </div>
        </div>
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
            ? `Listen to continue (${listenPercent}%)`
            : undefined
        }
      />
    </div>
  );
}

// ─── Legacy video meditation ───────────────────────────────────────────────────

function VideoMeditationPage({
  page,
  courseId,
  nextPageId,
  isLastPage,
  isCompleted,
  content,
}: InnerProps) {
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
          url={content.video_url!}
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

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
