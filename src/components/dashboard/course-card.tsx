import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type CourseWithEnrollment } from "@/types/course";

interface CourseCardProps {
  course: CourseWithEnrollment;
}

export function CourseCard({ course }: CourseCardProps) {
  const isEnrolled = !!course.enrollment;
  const progress = course.progress;
  const isCompleted = progress && progress.progress_percent >= 100;

  const href = isEnrolled
    ? course.enrollment?.last_page_id
      ? `/app/courses/${course.id}/pages/${course.enrollment.last_page_id}`
      : `/app/courses/${course.id}/pages`
    : `/app/courses/${course.id}`;

  return (
    <Link href={href} className="block">
      <article className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-low transition-all duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:bg-surface-container-high">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full bg-surface-container-high">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={`${course.title} course thumbnail`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span
                className="font-serif text-6xl text-on-surface-variant opacity-20"
                aria-hidden="true"
              >
                &#x0950;
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="secondary" className="w-fit">
              {course.course_type}
            </Badge>
            {isCompleted && (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700"
              >
                Completed
              </Badge>
            )}
          </div>
          <h3 className="mb-2 font-serif text-lg font-bold leading-tight text-on-surface">
            {course.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
            {course.description}
          </p>
          {course.teacher_name && (
            <p className="mt-auto pt-4 text-xs font-medium text-secondary">
              {course.teacher_name}
            </p>
          )}

          {/* Progress bar for enrolled courses */}
          {isEnrolled && progress && !isCompleted && (
            <div className="mt-4 space-y-1">
              <Progress
                value={progress.progress_percent}
                className="h-1.5"
                aria-label={`${progress.progress_percent}% complete`}
              />
              <p className="text-xs text-on-surface-variant">
                {progress.progress_percent}% complete
              </p>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
