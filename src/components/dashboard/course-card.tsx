import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { type Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
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
        <Badge variant="secondary" className="mb-3 w-fit">
          {course.course_type}
        </Badge>
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
      </div>
    </article>
  );
}
