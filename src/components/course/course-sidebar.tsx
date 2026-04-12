"use client";

import { useRouter, useParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Lock,
  PlayCircle,
  BookOpen,
  Wind,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CourseProgress, PageStatus, PageType } from "@/types/course";

const PAGE_TYPE_ICONS: Record<PageType, React.ComponentType<{ className?: string }>> = {
  video: PlayCircle,
  introspection: BookOpen,
  meditation: Wind,
};

interface CourseSidebarProps {
  courseTitle: string;
  progress: CourseProgress;
  onClose?: () => void;
}

export function CourseSidebar({
  courseTitle,
  progress,
  onClose,
}: CourseSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-outline-variant/10 p-4">
        <h2 className="font-serif text-base font-bold text-on-surface line-clamp-2">
          {courseTitle}
        </h2>
        <div className="mt-3 space-y-1">
          <p className="text-xs text-on-surface-variant">
            {progress.completed_pages} of {progress.total_pages} pages &mdash;{" "}
            {progress.progress_percent}%
          </p>
          <Progress
            value={progress.progress_percent}
            className="h-1.5"
            aria-label={`Course progress: ${progress.progress_percent}%`}
          />
        </div>
      </div>

      {/* Page list */}
      <ScrollArea className="flex-1">
        <nav className="p-2" aria-label="Course pages">
          {progress.page_statuses.map((page, index) => (
            <CoursePageItem
              key={page.page_id}
              page={page}
              index={index}
              courseId={progress.enrollment?.course_id || ""}
              onNavigate={onClose}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

interface CoursePageItemProps {
  page: PageStatus;
  index: number;
  courseId: string;
  onNavigate?: () => void;
}

function CoursePageItem({
  page,
  index,
  courseId,
  onNavigate,
}: CoursePageItemProps) {
  const router = useRouter();
  const params = useParams();
  const currentPageId = params.pageId as string;
  const isCurrent = page.page_id === currentPageId;
  const isCompleted = page.status === "completed";
  const isLocked = page.status === "locked";
  const PageIcon = PAGE_TYPE_ICONS[page.page_type];

  const handleClick = () => {
    if (isLocked) return;
    router.push(`/app/courses/${courseId}/pages/${page.page_id}`);
    onNavigate?.();
  };

  const content = (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLocked}
      className={cn(
        "flex w-full min-h-[44px] items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)]",
        isCurrent && "bg-primary/10 font-semibold text-on-surface",
        isCompleted && !isCurrent && "text-on-surface hover:bg-surface-container-high",
        isLocked && "cursor-not-allowed text-on-surface-variant/50",
        !isCurrent && !isCompleted && !isLocked && "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      )}
      aria-current={isCurrent ? "page" : undefined}
      aria-disabled={isLocked}
      aria-label={`${index + 1}. ${page.title}${isLocked ? " (locked)" : ""}${isCompleted ? " (completed)" : ""}${!page.is_strict ? " (optional)" : ""}`}
    >
      {/* Status icon */}
      <span className="mt-0.5 flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        ) : isCurrent ? (
          <ChevronRight className="h-4 w-4 text-primary" aria-hidden="true" />
        ) : isLocked ? (
          <Lock className="h-4 w-4" aria-hidden="true" />
        ) : (
          <PageIcon className="h-4 w-4" aria-hidden="true" />
        )}
      </span>

      {/* Title */}
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2">
          {index + 1}. {page.title}
        </span>
        {!page.is_strict && (
          <span className="ml-1 text-[10px] text-on-surface-variant">(optional)</span>
        )}
      </span>
    </button>
  );

  if (isLocked) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>Complete the previous page to unlock</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
