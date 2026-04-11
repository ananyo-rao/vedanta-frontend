import Image from "next/image";

export function AboutVedanta() {
  return (
    <section
      id="about-vedanta"
      className="scroll-mt-20 bg-surface-container-low px-6 py-24 lg:px-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div className="asymmetric-gutter">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
              The Philosophy
            </span>
            <h3 className="mb-6 font-serif text-4xl font-bold tracking-tight text-on-surface">
              What is Vedanta?
            </h3>
            <p className="mb-6 text-base leading-[1.6] text-on-surface-variant">
              Advaita Vedanta, as revealed in the Upani&#x1E63;ads, teaches a
              simple yet profound truth: the individual is not separate from the
              ultimate reality, Brahman. The apparent sense of limitation,
              bondage, and incompleteness experienced by the individual is due
              to ignorance of one&rsquo;s true nature.
            </p>
            <p className="text-base leading-[1.6] text-on-surface-variant">
              According to Swami Dayananda Saraswati, this ignorance
              (avidy&amacr;) is the root problem, and self-knowledge
              (&amacr;tma-j&ntilde;&amacr;na) is the only solution.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="h-80 w-80 overflow-hidden rounded-2xl bg-surface-container-highest shadow-[0_4px_32px_rgba(30,27,19,0.10)]">
                <Image
                  src="/images/vedanta.webp"
                  alt="Vedanta — the vision of non-duality"
                  width={320}
                  height={320}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-xl bg-primary-container opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
