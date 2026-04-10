import { type CourseWithEnrollment } from "@/types/course";
import { CourseCard } from "@/components/dashboard/course-card";

interface CourseGridProps {
  courses: CourseWithEnrollment[];
}

export function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
