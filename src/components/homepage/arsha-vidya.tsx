export function ArshVidya() {
  return (
    <section className="bg-surface-container-low px-6 py-24 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-14 text-center">
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.25em] text-tertiary">
            The Tradition Today
          </span>
          <h2 className="font-serif text-4xl font-semibold text-primary">
            Arsha Vidyā — Knowledge of the Rishis
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface grid grid-cols-1 md:grid-cols-2">
          {/* Left: description */}
          <div className="flex flex-col justify-center px-10 py-12">
            <h3 className="mb-2 font-serif text-2xl font-semibold text-primary">
              Arsha Vidyā Gurukulam
            </h3>
            <p className="mb-5 text-sm italic text-tertiary">
              &ldquo;A place of learning the knowledge of the Rishis&rdquo;
            </p>
            <p className="text-[15px] font-light leading-[1.8] text-on-surface-variant">
              Founded in 1986 by Pūjya Swami Dayananda Saraswati, the Arsha
              Vidyā Gurukulam is a residential centre for the traditional study
              of Advaita Vedanta, Sanskrit, and allied disciplines. Swami
              Dayananda designed seven long-term courses, each spanning 30 to 36
              months, graduating qualified Āchāryas who now teach across the
              world. Today, over sixty centres in India and abroad carry on this
              same tradition of Vedantic teaching.
            </p>
          </div>

          {/* Right: stats */}
          <div className="flex flex-col justify-center gap-6 bg-surface-container px-10 py-12">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-4xl font-semibold text-primary">
                7
              </span>
              <span className="text-sm font-light leading-snug text-on-surface-variant">
                Long-term residential
                <br />
                Vedanta courses taught
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-4xl font-semibold text-primary">
                200+
              </span>
              <span className="text-sm font-light leading-snug text-on-surface-variant">
                Sannyāsi disciples
                <br />
                teaching worldwide
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-4xl font-semibold text-primary">
                60+
              </span>
              <span className="text-sm font-light leading-snug text-on-surface-variant">
                Teaching centres
                <br />
                across the globe
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Rishikesh", "Coimbatore", "Nagpur", "Pennsylvania, USA"].map(
                (loc) => (
                  <span
                    key={loc}
                    className="rounded-full bg-primary-fixed px-3 py-1 text-[11px] font-medium text-on-primary-container"
                  >
                    {loc}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
