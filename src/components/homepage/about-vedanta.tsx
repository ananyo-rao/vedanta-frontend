export function AboutVedanta() {
  return (
    <section
      id="about-vedanta"
      className="scroll-mt-20 bg-surface-container-low px-6 py-24 lg:px-20"
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-14 text-center">
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.25em] text-tertiary">
            The Knowledge
          </span>
          <h2 className="font-serif text-4xl font-semibold text-primary">
            What is Vedanta?
          </h2>
        </div>

        <div className="space-y-6">
          <p className="text-base font-light leading-[1.9] text-on-surface-variant">
            <strong className="font-medium text-on-surface">Vedanta</strong>{" "}
            means the &ldquo;end part of the Veda&rdquo; — the culmination of
            the Vedic wisdom tradition.
          </p>
          <p className="text-base font-light leading-[1.9] text-on-surface-variant">
            Advaita Vedanta is the study of the Self which is beyond the
            limitations of the body-mind senses, which is ever fulfilled, ever
            secure, ever happy, immortal, limitless. This is my true nature. It
            is not something that I have to become, but something which I already
            am. I just need to realize and own up to this limitless nature of
            myself.
          </p>
          <p className="text-base font-light leading-[1.9] text-on-surface-variant">
            The Advaita Vedanta studies help us to realize, recognize, and own
            up to this limitless nature of ourselves. Our ancient sages and
            rishis have designed the methodology to recognize the self through
            special study techniques which helps remove all the self-doubts and
            ignorance about our true nature.
          </p>

          {/* Central quote */}
          <blockquote className="my-10 border-b border-t border-outline-variant py-9 text-center">
            <p className="font-serif text-2xl italic leading-relaxed text-primary">
              &ldquo;You are the whole. You feel small, limited and
              insignificant only because you know that you are, but do not know
              what you are. Knowledge is the only remedy.&rdquo;
            </p>
            <footer className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
              — Swami Dayananda Saraswati
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
