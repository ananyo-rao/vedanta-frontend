"use client";

import Image from "next/image";
import { useAuthHref } from "@/hooks/use-auth-href";

export function HeroSection() {
  const coursesHref = useAuthHref();

  return (
    <section
      id="home"
      className="scroll-mt-20 relative flex flex-col items-center justify-center overflow-hidden px-6 py-28 text-center lg:py-36"
    >
      {/* Background Dakshinamurthy — inverted so the black bg disappears via multiply blend,
          sepia shifts the remaining figure toward warm saffron tones */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <Image
          src="/images/dakshinamurthy.png"
          alt=""
          fill
          className="object-contain object-center"
          style={{
            filter: "invert(1) sepia(1) hue-rotate(5deg) saturate(0.5)",
            mixBlendMode: "multiply",
            opacity: 0.07,
          }}
          priority
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        <span className="mb-7 block text-[11px] font-semibold uppercase tracking-[0.25em] text-tertiary">
          Vedanta Vidyalaya
        </span>

        <h1 className="mb-7 font-serif text-5xl font-semibold leading-[1.15] text-primary md:text-6xl">
          Vedanta is the
          <br />
          study of the{" "}
          <em className="italic text-primary-container">Self.</em>
        </h1>

        <p className="mb-11 text-lg font-light leading-relaxed text-on-surface-variant md:text-xl">
          An online learning platform for the traditional study of Advaita
          Vedanta, the study of the ultimate self, which is immortal, limitless,
          ever-happy, ever-secure, ever-fulfilled.
        </p>

        <a
          href={coursesHref}
          className="inline-block rounded-lg bg-primary px-10 py-4 text-sm font-semibold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-90"
        >
          Begin Your Study
        </a>
      </div>
    </section>
  );
}
