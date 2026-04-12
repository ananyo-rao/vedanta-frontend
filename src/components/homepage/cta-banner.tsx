"use client";

import { useAuthHref } from "@/hooks/use-auth-href";

export function CtaBanner() {
  const coursesHref = useAuthHref();

  return (
    <section className="relative overflow-hidden bg-[#1e1b13] px-6 py-20 text-center">
      {/* Background Om */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="font-serif text-[20rem] leading-none text-white opacity-[0.03]">
          &#x0950;
        </span>
      </div>

      <div className="relative z-10">
        <h2 className="mb-4 font-serif text-3xl font-semibold text-[#fff8ef] md:text-4xl">
          Begin your study of the Self.
        </h2>
        <p className="mb-9 text-base font-light text-white/60">
          Explore courses rooted in the Arsha Vidyā tradition, taught in the
          Guru-Shishya Parampara.
        </p>
        <a
          href={coursesHref}
          className="inline-block rounded-lg bg-primary px-11 py-4 text-sm font-semibold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-90"
        >
          Explore Courses
        </a>
      </div>
    </section>
  );
}
