export function AboutParampara() {
  return (
    <section id="parampara" className="scroll-mt-20 bg-surface px-6 py-24 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          {/* Visual element on left */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="h-80 w-80 rounded-2xl bg-surface-container p-8">
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl bg-surface-container-low">
                  <span
                    className="font-serif text-5xl text-secondary opacity-50"
                    aria-hidden="true"
                  >
                    &#x0950;
                  </span>
                  <div className="h-px w-16 bg-outline-variant/30" />
                  <span
                    className="font-serif text-3xl text-tertiary opacity-40"
                    aria-hidden="true"
                  >
                    &#x0950;
                  </span>
                  <div className="h-px w-16 bg-outline-variant/30" />
                  <span
                    className="font-serif text-xl text-primary opacity-30"
                    aria-hidden="true"
                  >
                    &#x0950;
                  </span>
                </div>
              </div>
              <div className="absolute -left-4 -top-4 h-24 w-24 rounded-xl bg-secondary-container opacity-60" />
            </div>
          </div>

          {/* Text on right */}
          <div className="asymmetric-gutter">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
              The Living Tradition
            </span>
            <h3 className="mb-6 font-serif text-4xl font-bold tracking-tight text-on-surface">
              The Guru-Shishya Parampara
            </h3>
            <p className="mb-6 text-base leading-[1.6] text-on-surface-variant">
              The Sanskrit word &ldquo;parampara&rdquo; means an unbroken chain
              of succession. In the Vedantic tradition, knowledge is transmitted
              directly from teacher (guru) to student (shishya), preserving not
              just intellectual content but the living spirit of inquiry.
            </p>
            <p className="text-base leading-[1.6] text-on-surface-variant">
              This lineage stretches back thousands of years, from the great Adi
              Shankaracharya through generations of dedicated acharyas. At
              Vedanta Academy, we honour this tradition by maintaining the
              personal, dialogue-based method of teaching that allows each
              student to progress at their own pace of understanding.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
