import { auth } from "@clerk/nextjs/server";
import { CourseGrid } from "@/components/dashboard/course-grid";
import { EmptyState } from "@/components/dashboard/empty-state";
import { type Course } from "@/types/course";

async function fetchCourses(
  token: string
): Promise<{ data: Course[]; total: number }> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/app";

  const response = await fetch(`${API_URL}/api/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch courses: ${response.status}`);
  }

  return response.json();
}

export default async function DashboardPage() {
  const { getToken } = await auth();
  const token = await getToken();

  let courses: Course[] = [];
  let error: string | null = null;

  if (token) {
    try {
      const result = await fetchCourses(token);
      courses = result.data ?? [];
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load courses";
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-on-surface">
          Courses
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Browse your available courses
        </p>
      </div>

      {error ? (
        <div className="rounded-xl bg-error-container p-6 text-center">
          <p className="text-sm font-medium text-on-error-container">
            Unable to load courses. Please try again later.
          </p>
        </div>
      ) : courses.length > 0 ? (
        <CourseGrid courses={courses} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
