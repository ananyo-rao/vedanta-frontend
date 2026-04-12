"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CourseSidebar } from "@/components/course/course-sidebar";
import { useCourseProgress, useCourseDetail } from "@/hooks/use-courses";
import { useCoursePlayerStore } from "@/hooks/use-course-player";

export default function CoursePlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { data: progress, isLoading } = useCourseProgress(courseId);
  const { data: courseDetail } = useCourseDetail(courseId);
  const { sidebarOpen, setSidebarOpen, toggleSidebar } =
    useCoursePlayerStore();
  const courseTitle = courseDetail?.title || "";

  if (isLoading || !progress) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.6)*2)] items-center justify-center sm:h-[calc(100vh-theme(spacing.6)*2)]">
        <p className="text-sm text-on-surface-variant">Loading course...</p>
      </div>
    );
  }

  return (
    <div className="-m-6 flex h-screen flex-col sm:-m-6 lg:-m-8">
      {/* Mobile top bar */}
      <div className="flex items-center gap-2 border-b border-outline-variant/10 bg-surface px-3 py-2 sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/app/dashboard")}
          aria-label="Back to courses"
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-on-surface">
          {courseTitle || "Course"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Open course outline"
          className="h-10 w-10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 flex-shrink-0 border-r border-outline-variant/10 bg-surface-container-low sm:block">
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-outline-variant/10 px-3 py-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/app/dashboard")}
                aria-label="Back to courses"
                className="h-10 w-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-xs font-medium uppercase tracking-widest text-on-surface-variant/60">
                Course Outline
              </span>
            </div>
            <CourseSidebar
              courseTitle={courseTitle}
              progress={progress}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto" id="course-content">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-80 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Course Outline</SheetTitle>
          </SheetHeader>
          <CourseSidebar
            courseTitle=""
            progress={progress}
            onClose={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
