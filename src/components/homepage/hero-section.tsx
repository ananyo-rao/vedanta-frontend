import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="watercolor-bg relative flex min-h-[750px] items-center overflow-hidden px-6 py-20 lg:px-20"
    >
      {/* Background Om symbol */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5"
        aria-hidden="true"
      >
        <span className="font-serif text-[40rem] leading-none text-on-surface">
          &#x0950;
        </span>
      </div>

      <div className="relative z-10 max-w-4xl">
        <span className="mb-6 block text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
          Ancient wisdom for the modern seeker
        </span>

        <h2 className="mb-8 font-serif text-5xl font-black leading-[1.1] tracking-tight text-on-surface md:text-7xl">
          Vedanta, a journey{" "}
          <span className="block">to discover the self</span>
        </h2>

        <p className="mb-12 max-w-2xl text-xl leading-relaxed text-on-surface-variant md:text-2xl">
          Live guided courses in Advaita Vedanta, Bhagavad Gita, and meditation,
          designed for deep introspection and clarity.
        </p>

        <div className="flex flex-col gap-6 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="#courses">
              Explore Courses
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#teachers">Meet Our Teachers</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
