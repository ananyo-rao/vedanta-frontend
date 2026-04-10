"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCompletePage } from "@/hooks/use-courses";

interface CompleteAndContinueProps {
  courseId: string;
  pageId: string;
  nextPageId: string | null;
  isStrict: boolean;
  canComplete: boolean;
  isAlreadyCompleted: boolean;
  isLastPage: boolean;
  progressHint?: string;
}

export function CompleteAndContinue({
  courseId,
  pageId,
  nextPageId,
  isStrict,
  canComplete,
  isAlreadyCompleted,
  isLastPage,
  progressHint,
}: CompleteAndContinueProps) {
  const router = useRouter();
  const completePage = useCompletePage(courseId);

  const handleClick = async () => {
    try {
      if (!isAlreadyCompleted) {
        await completePage.mutateAsync(pageId);
      }

      if (isLastPage && !isAlreadyCompleted) {
        router.push(`/app/courses/${courseId}/complete`);
      } else if (nextPageId) {
        router.push(`/app/courses/${courseId}/pages/${nextPageId}`);
      } else {
        router.push("/app/dashboard");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to complete page"
      );
    }
  };

  const disabled =
    isStrict && !canComplete && !isAlreadyCompleted;

  let label: string;
  if (isAlreadyCompleted) {
    label = nextPageId ? "Continue" : "Return to Courses";
  } else if (isLastPage) {
    label = "Complete Course";
  } else if (!isStrict) {
    label = "Continue";
  } else {
    label = "Complete and Continue";
  }

  return (
    <div className="mt-8 space-y-2">
      <Button
        size="lg"
        className="w-full"
        onClick={handleClick}
        disabled={disabled || completePage.isPending}
        aria-label={label}
      >
        {completePage.isPending ? (
          "Processing..."
        ) : (
          <>
            {label}
            {isAlreadyCompleted ? (
              <Check className="ml-2 h-4 w-4" />
            ) : (
              <ArrowRight className="ml-2 h-4 w-4" />
            )}
          </>
        )}
      </Button>
      {disabled && progressHint && (
        <p className="text-center text-xs text-on-surface-variant">
          {progressHint}
        </p>
      )}
    </div>
  );
}
