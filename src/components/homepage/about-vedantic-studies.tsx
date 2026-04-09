"use client";

import { Brain, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuthHref } from "@/hooks/use-auth-href";

const courses = [
  {
    icon: Brain,
    title: "Introduction to Advaita",
    description:
      "Explore the non-dual reality through the lenses of Shankara's commentaries.",
    duration: "8 Weeks",
  },
  {
    icon: Brain,
    title: "Karma Yoga",
    description:
      "Mastering the art of selfless action and emotional balance in the modern workspace.",
    duration: "6 Weeks",
  },
];

export function AboutVedanticStudies() {
  const coursesHref = useAuthHref();

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Large Featured Card */}
          <div className="group relative min-h-[400px] overflow-hidden rounded-xl bg-surface-container-highest md:col-span-8">
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/20 to-transparent" />
            <div className="absolute inset-0 bg-surface-container-high" />
            <div className="absolute bottom-0 left-0 z-10 p-10 text-on-primary">
              <span className="mb-4 inline-block rounded-full bg-primary-container px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-primary-container">
                Featured &bull; 12 Weeks
              </span>
              <h4 className="mb-4 font-serif text-4xl font-bold">
                The Bhagavad Gita: Yoga of Action
              </h4>
              <p className="mb-8 max-w-md font-light leading-relaxed text-surface-container-lowest opacity-90">
                An intensive journey through the 700 verses of the Gita, focusing
                on practical application in daily life.
              </p>
              <Link
                href={coursesHref}
                className="inline-block rounded-md bg-primary px-8 py-3 text-sm font-bold text-on-primary transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:bg-primary-container"
              >
                View Course Details
              </Link>
            </div>
          </div>

          {/* Secondary Course Cards */}
          {courses.map((course) => (
            <div
              key={course.title}
              className="group flex flex-col justify-between rounded-xl bg-surface-container-low p-8 transition-all duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:bg-surface-container-highest md:col-span-4"
            >
              <div>
                <div className="mb-6 flex items-start justify-between">
                  <course.icon className="h-9 w-9 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    {course.duration}
                  </span>
                </div>
                <h4 className="mb-3 font-serif text-2xl font-bold text-on-surface">
                  {course.title}
                </h4>
                <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
                  {course.description}
                </p>
              </div>
              <Link
                href={coursesHref}
                className="flex items-center gap-2 font-bold text-primary transition-all duration-[var(--duration-base)] ease-[var(--ease-intentional)] group-hover:gap-4"
              >
                Enroll Now{" "}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ))}

          {/* Wide Bottom Card */}
          <div className="flex flex-col items-center gap-8 rounded-xl bg-surface-container-high p-10 md:col-span-8 md:flex-row">
            <div className="flex-1">
              <h4 className="mb-4 font-serif text-2xl font-bold text-on-surface">
                Meditation &amp; Upasana
              </h4>
              <p className="mb-6 text-base leading-relaxed text-on-surface-variant">
                Guided sessions on mental focus, deity contemplation, and the path
                to inner silence.
              </p>
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
      </div>
    </section>
  );
}
