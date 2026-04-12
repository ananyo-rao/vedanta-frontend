import { type CourseWithEnrollment } from "@/types/course";
import { CourseCard } from "@/components/dashboard/course-card";

interface CourseGridProps {
  courses: CourseWithEnrollment[];
}

export function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
