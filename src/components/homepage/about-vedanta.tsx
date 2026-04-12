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
            means the &ldquo;end of the Veda&rdquo; — the culmination of the
            Vedic wisdom tradition. It is not a belief system or a philosophy to
            be debated, but a{" "}
            <strong className="font-medium text-on-surface">
              means of knowledge
            </strong>{" "}
            (pram&#x101;&#x1E47;a) that reveals the nature of the self, the
            world, and their relationship.
          </p>
          <p className="text-base font-light leading-[1.9] text-on-surface-variant">
            The central teaching of Advaita Vedanta is direct and unequivocal:
            the reality of the individual self (&Amacr;tman) and the universal
            reality (Brahman) are one and the same. What we take to be
            limitation, inadequacy, and incompleteness is born not of a
            deficiency in ourselves, but of{" "}
            <strong className="font-medium text-on-surface">
              ignorance about our true nature
            </strong>
            .
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

          <p className="text-base font-light leading-[1.9] text-on-surface-variant">
            This knowledge is unfolded through the systematic study of three
            foundational texts — the{" "}
            <strong className="font-medium text-on-surface">Upanishads</strong>,
            the{" "}
            <strong className="font-medium text-on-surface">
              Bhagavad Gita
            </strong>
            , and the{" "}
            <strong className="font-medium text-on-surface">
              Brahma S&#x16B;tras
            </strong>{" "}
            — collectively known as the Prasth&#x101;natraya. But Vedanta cannot
            be learned from texts alone. It requires a qualified teacher who has
            received this knowledge in an unbroken lineage, and who can
            communicate it clearly to a prepared student.
          </p>
          <p className="text-base font-light leading-[1.9] text-on-surface-variant">
            That lineage of teacher and student is called the{" "}
            <strong className="font-medium text-on-surface">
              Guru-Shishya Parampara
            </strong>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
