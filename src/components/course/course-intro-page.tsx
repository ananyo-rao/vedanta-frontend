"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  PlayCircle,
  BookOpen,
  Wind,
  Clock,
  BookMarked,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCourseDetail, useEnroll } from "@/hooks/use-courses";
import type { PageType } from "@/types/course";

const PAGE_TYPE_ICONS: Record<PageType, React.ReactNode> = {
  video: <PlayCircle className="h-4 w-4 text-primary" />,
  introspection: <BookOpen className="h-4 w-4 text-primary" />,
  meditation: <Wind className="h-4 w-4 text-primary" />,
};

const PAGE_TYPE_LABELS: Record<PageType, string> = {
  video: "Video",
  introspection: "Introspection",
  meditation: "Meditation",
};

interface CourseIntroPageProps {
  courseId: string;
}

export function CourseIntroPage({ courseId }: CourseIntroPageProps) {
  const router = useRouter();
  const { data: course, isLoading, error } = useCourseDetail(courseId);
  const enroll = useEnroll(courseId);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-on-surface-variant">
        Loading course...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="rounded-xl bg-error-container p-6 text-center">
        <p className="text-sm font-medium text-on-error-container">
          {error instanceof Error ? error.message : "Course not found"}
        </p>
      </div>
    );
  }

  const isEnrolled = !!course.enrollment;
  const pages = course.pages || [];

  const handleEnroll = async () => {
    try {
      await enroll.mutateAsync();
      toast.success("You are now enrolled!");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not enroll. Please try again."
      );
    }
  };

  const handleBeginCourse = () => {
    if (course.enrollment?.last_page_id) {
      router.push(
        `/app/courses/${courseId}/pages/${course.enrollment.last_page_id}`
      );
    } else if (pages.length > 0) {
      router.push(`/app/courses/${courseId}/pages/${pages[0].id}`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/app/dashboard" aria-label="Back to courses">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Courses
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ─── Main Content (Left 2/3) ─── */}
        <div className="lg:col-span-2">
          {/* Course type badge */}
          {course.course_type && (
            <Badge variant="secondary" className="mb-3">
              {course.course_type}
            </Badge>
          )}

          {/* Title */}
          <h1 className="mb-3 font-serif text-3xl font-bold leading-tight text-on-surface md:text-4xl">
            {course.title}
          </h1>

          {/* Teacher */}
          {course.teacher_name && (
            <p className="mb-4 text-sm text-on-surface-variant">
              By{" "}
              <span className="font-medium text-on-surface">
                {course.teacher_name}
              </span>
            </p>
          )}

          {/* Description */}
          <p className="mb-6 text-base leading-relaxed text-on-surface-variant">
            {course.description}
          </p>

          {/* End date warning */}
          {course.end_date && (
            <div className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              This course is available until{" "}
              {format(new Date(course.end_date), "MMMM d, yyyy")}.
            </div>
          )}

          {/* Mobile: Video + Enroll */}
          <div className="mb-8 lg:hidden">
            {course.intro_video_url && (
              <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl bg-surface-container-high">
                <VideoEmbed url={course.intro_video_url} />
              </div>
            )}
            <EnrollButton
              isEnrolled={isEnrolled}
              isPending={enroll.isPending}
              onEnroll={handleEnroll}
              onBegin={handleBeginCourse}
            />
            {/* Metadata row */}
            <div className="mt-4 flex items-center gap-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <BookMarked className="h-3.5 w-3.5" />
                {pages.length} {pages.length === 1 ? "lesson" : "lessons"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Self-paced
              </span>
              <span className="font-medium text-primary">Free</span>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Course Curriculum */}
          {pages.length > 0 && (
            <div>
              <h2 className="mb-5 font-serif text-xl font-semibold text-on-surface">
                What You Will Study
              </h2>
              <ol className="space-y-1">
                {pages.map((page, index) => (
                  <li
                    key={page.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-surface-container-low"
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-high text-xs font-medium text-on-surface-variant">
                      {index + 1}
                    </span>
                    <span className="flex-shrink-0">
                      {PAGE_TYPE_ICONS[page.page_type]}
                    </span>
                    <span className="flex-1 text-on-surface">{page.title}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-normal text-on-surface-variant"
                    >
                      {PAGE_TYPE_LABELS[page.page_type]}
                    </Badge>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* ─── Sticky Sidebar (Right 1/3) ─── */}
        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            {/* Intro Video */}
            {course.intro_video_url && (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-surface-container-high shadow-sm">
                <VideoEmbed url={course.intro_video_url} />
              </div>
            )}

            {/* Enroll Button */}
            <EnrollButton
              isEnrolled={isEnrolled}
              isPending={enroll.isPending}
              onEnroll={handleEnroll}
              onBegin={handleBeginCourse}
            />

            {/* Metadata */}
            <div className="space-y-3 rounded-xl bg-surface-container-low p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Lessons</span>
                <span className="font-medium text-on-surface">
                  {pages.length}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Pace</span>
                <span className="font-medium text-on-surface">Self-paced</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Price</span>
                <span className="font-semibold text-primary">Free</span>
              </div>
              {course.teacher_name && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">Teacher</span>
                    <span className="font-medium text-on-surface">
                      {course.teacher_name}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnrollButton({
  isEnrolled,
  isPending,
  onEnroll,
  onBegin,
}: {
  isEnrolled: boolean;
  isPending: boolean;
  onEnroll: () => void;
  onBegin: () => void;
}) {
  if (isEnrolled) {
    return (
      <Button
        size="lg"
        className="w-full"
        onClick={onBegin}
        aria-label="Begin or continue course"
      >
        Begin Course
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={onEnroll}
      disabled={isPending}
      aria-label="Enroll in this course"
    >
      {isPending ? "Enrolling..." : "Enroll in This Course"}
    </Button>
  );
}

function VideoEmbed({ url }: { url: string }) {
  const youtubeId = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )?.[1];

  if (youtubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        className="h-full w-full"
        allowFullScreen
        title="Course intro video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    );
  }

  const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
  if (vimeoId) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId}`}
        className="h-full w-full"
        allowFullScreen
        title="Course intro video"
        allow="autoplay; fullscreen; picture-in-picture"
      />
    );
  }

  return (
    <video
      src={url}
      controls
      className="h-full w-full object-contain"
      preload="metadata"
    >
      <track kind="captions" />
    </video>
  );
}
