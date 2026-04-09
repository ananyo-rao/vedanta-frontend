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
              Vedanta is one of the six orthodox schools of Hindu philosophy. The
              term literally means &ldquo;end of the Vedas,&rdquo; referring to
              the Upanishads which form the concluding portion of Vedic
              literature. It is a tradition of inquiry into the nature of
              reality, the self, and the relationship between the two.
            </p>
            <p className="text-base leading-[1.6] text-on-surface-variant">
              At its heart, Advaita Vedanta teaches that the individual self
              (Atman) and the ultimate reality (Brahman) are one and the same.
              This teaching, passed down through an unbroken lineage of masters,
              invites the seeker to move beyond intellectual understanding into
              direct realization of their true nature.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="h-80 w-80 rounded-2xl bg-surface-container-highest p-8">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-surface-container">
                  <span
                    className="font-serif text-8xl text-primary opacity-30"
                    aria-hidden="true"
                  >
                    &#x0950;
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-xl bg-primary-container opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
