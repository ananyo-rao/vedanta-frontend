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
      <article className="group flex flex-row overflow-hidden rounded-xl bg-surface-container-low transition-all duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:bg-surface-container-high">
        {/* Thumbnail */}
        <div className="relative w-44 shrink-0 self-stretch sm:w-56">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={`${course.title} course thumbnail`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 176px, 224px"
            />
          ) : (
            <div className="relative h-full w-full bg-surface-container-high">
              <Image
                src="/images/dakshinamurthy.png"
                alt="Dakshinamurthy"
                fill
                className="object-contain p-4 opacity-40 grayscale"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
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

          <h3 className="font-serif text-xl font-bold leading-tight text-on-surface">
            {course.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
            {course.description}
          </p>

          {course.teacher_name && (
            <p className="mt-2 text-xs font-medium text-secondary">
              {course.teacher_name}
            </p>
          )}

          {/* Progress bar for enrolled courses */}
          {isEnrolled && progress && !isCompleted && (
            <div className="mt-3 space-y-1">
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

          {/* Action */}
          <div className="mt-auto pt-4">
            <span className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary">
              {isEnrolled
                ? isCompleted
                  ? "Review Course"
                  : "Resume"
                : "Enroll"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
