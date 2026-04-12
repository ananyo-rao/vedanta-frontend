"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CourseIntroForm } from "@/components/admin/course-intro-form";
import { useCreateCourse } from "@/hooks/use-courses-admin";
import type { CreateCourseInput } from "@/types/course-schemas";

export function NewCourseForm() {
  const router = useRouter();
  const createCourse = useCreateCourse();

  const handleSave = async (data: CreateCourseInput) => {
    try {
      const course = await createCourse.mutateAsync(data);
      toast.success("Course saved as draft");
      router.push(`/app/admin/course-builder/${course.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create course"
      );
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/admin/course-builder" aria-label="Back to course list">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <h1 className="mb-6 font-serif text-2xl font-bold text-on-surface">
        New Course
      </h1>

      <CourseIntroForm
        onSave={handleSave}
        saving={createCourse.isPending}
      />
    </div>
  );
}
