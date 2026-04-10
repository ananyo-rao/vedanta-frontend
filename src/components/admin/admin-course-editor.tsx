"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  MoreHorizontal,
  Calendar,
  CalendarOff,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CourseIntroForm } from "@/components/admin/course-intro-form";
import { SortablePageList } from "@/components/admin/sortable-page-list";
import { PageTypeSelector } from "@/components/admin/page-type-selector";
import { AdminPageEditor } from "@/components/admin/admin-page-editor";
import {
  useAdminCourse,
  useUpdateCourse,
  usePublishCourse,
  useUnpublishCourse,
  useSetEndDate,
  useAddPage,
  useUpdatePage,
  useDeletePage,
  useReorderPages,
} from "@/hooks/use-courses-admin";
import type { PageType, VideoContent, IntrospectionContent, MeditationContent } from "@/types/course";
import type { CreateCourseInput } from "@/types/course-schemas";

interface AdminCourseEditorProps {
  courseId: string;
}

export function AdminCourseEditor({ courseId }: AdminCourseEditorProps) {
  const router = useRouter();
  const { data: course, isLoading, error } = useAdminCourse(courseId);
  const updateCourse = useUpdateCourse(courseId);
  const publishCourse = usePublishCourse(courseId);
  const unpublishCourse = useUnpublishCourse(courseId);
  const setEndDate = useSetEndDate(courseId);
  const addPage = useAddPage(courseId);
  const updatePage = useUpdatePage(courseId);
  const deletePage = useDeletePage(courseId);
  const reorderPages = useReorderPages(courseId);

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [endDateDialogOpen, setEndDateDialogOpen] = useState(false);
  const [endDateValue, setEndDateValue] = useState("");
  const [addingPageType, setAddingPageType] = useState<PageType | null>(null);
  const [savingPageId, setSavingPageId] = useState<string | null>(null);

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

  const pages = course.pages || [];
  const canPublish =
    course.title &&
    course.description &&
    course.intro_video_url &&
    pages.length > 0;

  const handleSaveIntro = async (data: CreateCourseInput) => {
    try {
      await updateCourse.mutateAsync(data);
      toast.success("Course updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save"
      );
    }
  };

  const handlePublish = async () => {
    try {
      await publishCourse.mutateAsync();
      toast.success("Course published successfully");
      setPublishDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to publish"
      );
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishCourse.mutateAsync();
      toast.success("Course unpublished");
      setUnpublishDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to unpublish"
      );
    }
  };

  const handleSetEndDate = async () => {
    if (!endDateValue) return;
    try {
      await setEndDate.mutateAsync(endDateValue);
      toast.success(`End date set for ${format(new Date(endDateValue), "MMM d, yyyy")}`);
      setEndDateDialogOpen(false);
      setEndDateValue("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to set end date"
      );
    }
  };

  const handleRemoveEndDate = async () => {
    try {
      await setEndDate.mutateAsync(null);
      toast.success("End date removed");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove end date"
      );
    }
  };

  const handleAddPage = async (data: {
    title: string;
    page_type: PageType;
    is_strict: boolean;
    content: VideoContent | IntrospectionContent | MeditationContent;
  }) => {
    try {
      await addPage.mutateAsync(data);
      toast.success("Page added");
      setAddingPageType(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add page"
      );
    }
  };

  const handleUpdatePage = async (
    pageId: string,
    data: {
      title: string;
      page_type: PageType;
      is_strict: boolean;
      content: VideoContent | IntrospectionContent | MeditationContent;
    }
  ) => {
    setSavingPageId(pageId);
    try {
      await updatePage.mutateAsync({ pageId, data });
      toast.success("Page updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update page"
      );
    } finally {
      setSavingPageId(null);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    await deletePage.mutateAsync(pageId);
  };

  const handleReorder = async (pageIds: string[]) => {
    await reorderPages.mutateAsync(pageIds);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/admin/course-builder" aria-label="Back to course list">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>

        <StatusBadge status={course.status} />

        {course.end_date && (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700"
          >
            Ending {format(new Date(course.end_date), "MMM d, yyyy")}
          </Badge>
        )}

        <div className="ml-auto flex gap-2">
          {course.status === "draft" ? (
            <Button
              onClick={() => setPublishDialogOpen(true)}
              disabled={!canPublish || publishCourse.isPending}
              aria-label="Publish course"
            >
              {publishCourse.isPending ? "Publishing..." : "Publish Course"}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setUnpublishDialogOpen(true)}
              disabled={unpublishCourse.isPending}
              aria-label="Unpublish course"
            >
              Unpublish
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!course.end_date ? (
                <DropdownMenuItem
                  onClick={() => setEndDateDialogOpen(true)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Set End Date
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleRemoveEndDate}>
                  <CalendarOff className="mr-2 h-4 w-4" />
                  Remove End Date
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {!canPublish && course.status === "draft" && (
        <p className="mb-4 text-xs text-on-surface-variant">
          Complete the course intro and add at least one page to publish.
        </p>
      )}

      {/* Course Title */}
      <h1 className="mb-6 font-serif text-2xl font-bold text-on-surface">
        {course.title || "Untitled Course"}
      </h1>

      {/* Course Intro Form */}
      <CourseIntroForm
        course={course}
        onSave={handleSaveIntro}
        saving={updateCourse.isPending}
      />

      <Separator className="my-6" />

      {/* Pages Section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-on-surface">
          Pages ({pages.length})
        </h2>
        <PageTypeSelector onSelect={(type) => setAddingPageType(type)} />
      </div>

      <SortablePageList
        pages={pages}
        onReorder={handleReorder}
        onUpdatePage={handleUpdatePage}
        onDeletePage={handleDeletePage}
        savingPageId={savingPageId}
      />

      {/* New page editor */}
      {addingPageType && (
        <div className="mt-4">
          <AdminPageEditor
            pageType={addingPageType}
            onSave={handleAddPage}
            onCancel={() => setAddingPageType(null)}
            saving={addPage.isPending}
          />
        </div>
      )}

      {/* Publish confirmation dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Course</DialogTitle>
            <DialogDescription>
              Publishing will make this course visible to all students. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPublishDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishCourse.isPending}
            >
              {publishCourse.isPending ? "Publishing..." : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unpublish confirmation dialog */}
      <Dialog open={unpublishDialogOpen} onOpenChange={setUnpublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unpublish Course</DialogTitle>
            <DialogDescription>
              Unpublishing will hide this course from new students. Enrolled
              students will retain access. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUnpublishDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnpublish}
              disabled={unpublishCourse.isPending}
            >
              {unpublishCourse.isPending ? "Unpublishing..." : "Unpublish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End date dialog */}
      <Dialog open={endDateDialogOpen} onOpenChange={setEndDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set End Date</DialogTitle>
            <DialogDescription>
              After this date, the course will be permanently removed. Enrolled
              students will see a notice until then.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDateValue}
              onChange={(e) => setEndDateValue(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEndDateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSetEndDate}
              disabled={!endDateValue || setEndDate.isPending}
            >
              {setEndDate.isPending ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 text-emerald-700"
      >
        Published
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-on-surface-variant">
      Draft
    </Badge>
  );
}
