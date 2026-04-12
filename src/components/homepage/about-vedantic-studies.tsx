"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useAuthHref } from "@/hooks/use-auth-href";
import { listPublicCourses } from "@/lib/api/courses-student";
import type { Course } from "@/types/course";

function usePublicCourses() {
  return useQuery<Course[]>({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const res = await listPublicCourses();
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — public data changes infrequently
  });
}

function CourseSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-surface-container-low md:col-span-4">
      <div className="min-h-[200px] rounded-xl bg-surface-container" />
    </div>
  );
}

export function AboutVedanticStudies() {
  const coursesHref = useAuthHref();
  const { data: courses = [], isLoading, isError } = usePublicCourses();

  const [featured, ...rest] = courses;

  return (
    <section id="about-courses" className="scroll-mt-20 bg-surface px-6 py-24 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div className="max-w-xl">
            <h3 className="mb-4 font-serif text-4xl font-bold tracking-tight text-on-surface">
              Our Courses
            </h3>
            <div className="h-1 w-20 bg-primary" />
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-secondary">
            Curated Learning Paths
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="animate-pulse rounded-xl bg-surface-container md:col-span-8 min-h-[400px]" />
            <CourseSkeleton />
            <CourseSkeleton />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-error-container py-20 text-center">
            <p className="text-sm font-medium text-on-error-container">
              Could not load courses. Please refresh the page.
            </p>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-low py-20 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-on-surface-variant opacity-40" />
            <p className="mb-6 text-base text-on-surface-variant">
              Courses are being prepared. Check back soon.
            </p>
            <Link
              href={coursesHref}
              className="inline-block rounded-md bg-primary px-6 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              Sign In to Browse
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Featured course — first in list */}
            {featured && (
              <div className="group relative min-h-[400px] overflow-hidden rounded-xl bg-surface-container-highest md:col-span-8">
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/20 to-transparent" />
                <div className="absolute inset-0 bg-surface-container-high" />
                <div className="absolute bottom-0 left-0 z-10 p-10 text-on-primary">
                  <span className="mb-4 inline-block rounded-full bg-primary-container px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-primary-container">
                    {featured.course_type}
                  </span>
                  <h4 className="mb-4 font-serif text-4xl font-bold">
                    {featured.title}
                  </h4>
                  <p className="mb-8 max-w-md font-light leading-relaxed text-surface-container-lowest opacity-90">
                    {featured.description}
                  </p>
                  <Link
                    href={coursesHref}
                    className="inline-block rounded-md bg-primary px-8 py-3 text-sm font-bold text-on-primary transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:bg-primary-container"
                  >
                    View Course Details
                  </Link>
                </div>
              </div>
            )}

            {/* Secondary course cards */}
            {rest.slice(0, 2).map((course) => (
              <div
                key={course.id}
                className="group flex flex-col justify-between rounded-xl bg-surface-container-low p-8 transition-all duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:bg-surface-container-highest md:col-span-4"
              >
                <div>
                  <div className="mb-6 flex items-start justify-between">
                    <BookOpen className="h-9 w-9 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                      {course.course_type}
                    </span>
                  </div>
                  <h4 className="mb-3 font-serif text-2xl font-bold text-on-surface">
                    {course.title}
                  </h4>
                  <p className="mb-6 text-sm leading-relaxed text-on-surface-variant line-clamp-3">
                    {course.description}
                  </p>
                </div>
                <Link
                  href={coursesHref}
                  className="flex items-center gap-2 font-bold text-primary transition-all duration-[var(--duration-base)] ease-[var(--ease-intentional)] group-hover:gap-4"
                >
                  Enroll Now <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}

            {/* Wide bottom card */}
            <div className="flex flex-col items-center gap-8 rounded-xl bg-surface-container-high p-10 md:col-span-8 md:flex-row">
              <div className="flex-1">
                {rest[2] ? (
                  <>
                    <h4 className="mb-4 font-serif text-2xl font-bold text-on-surface">
                      {rest[2].title}
                    </h4>
                    <p className="mb-6 text-base leading-relaxed text-on-surface-variant line-clamp-2">
                      {rest[2].description}
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="mb-4 font-serif text-2xl font-bold text-on-surface">
                      Begin Your Journey
                    </h4>
                    <p className="mb-6 text-base leading-relaxed text-on-surface-variant">
                      Sign in to access all courses, track your progress, and join
                      live sessions with Swami Satchitananda.
                    </p>
                  </>
                )}
                <Link
                  href={coursesHref}
                  className="inline-block rounded-md bg-secondary px-6 py-2 text-sm font-bold text-on-secondary transition-opacity hover:opacity-90"
                >
                  Browse All Courses
                </Link>
              </div>
              <div className="h-48 w-48 flex-shrink-0 overflow-hidden rounded-full bg-surface-container-lowest shadow-xl">
                <div className="flex h-full w-full items-center justify-center bg-surface-container text-on-surface-variant">
                  <span className="font-serif text-6xl opacity-30">&#x0950;</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
