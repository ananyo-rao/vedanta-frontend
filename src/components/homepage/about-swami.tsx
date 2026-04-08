export function AboutSwami() {
  return (
    <section className="bg-surface-container-low px-6 py-24 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div className="asymmetric-gutter">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
              Our Founding Teacher
            </span>
            <h3 className="mb-6 font-serif text-4xl font-bold tracking-tight text-on-surface">
              Swami Satchitananda
            </h3>
            <p className="mb-6 text-base leading-[1.6] text-on-surface-variant">
              Swami Satchitananda has dedicated over four decades to the study
              and teaching of Advaita Vedanta. A disciple of the revered
              tradition of Shankaracharya, Swamiji brings together profound
              scriptural scholarship with a warm, accessible teaching style.
            </p>
            <p className="mb-6 text-base leading-[1.6] text-on-surface-variant">
              Under his guidance, Vedanta Vidyalaya was established to create a
              space where seekers from all walks of life could engage with the
              timeless wisdom of the Vedantic texts in a structured, supportive
              environment.
            </p>
            <blockquote className="rounded-xl bg-surface-container p-6">
              <p className="font-serif text-lg italic leading-relaxed text-on-surface">
                &ldquo;The purpose of Vedanta is not to give you something new,
                but to reveal that which you already possess.&rdquo;
              </p>
              <footer className="mt-3 text-xs font-bold uppercase tracking-widest text-primary">
                &mdash; Swami Satchitananda
              </footer>
            </blockquote>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="h-96 w-80 overflow-hidden rounded-2xl bg-surface-container-highest">
                <div className="flex h-full w-full items-center justify-center bg-surface-container">
                  <div className="text-center">
                    <span
                      className="block font-serif text-7xl text-primary opacity-20"
                      aria-hidden="true"
                    >
                      &#x0950;
                    </span>
                    <p className="mt-4 text-xs uppercase tracking-widest text-on-surface-variant">
                      Portrait placeholder
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-xl bg-tertiary-container opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
