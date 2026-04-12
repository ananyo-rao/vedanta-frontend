import Image from "next/image";

const nodes = [
  {
    size: "sm",
    label: "Daiva Parampara",
    name: "Narayana / Dakshinamurthy",
    desc: "The Lord — the original source of all knowledge. Lord Shiva as Dakshinamurthy, the first Guru, taught the Rishis in silence under the banyan tree.",
    image: { src: "/images/arsha-vidya-icon.png", alt: "Dakshinamurthy", style: "bg-[#1a1a1a] object-contain p-1" },
  },
  {
    size: "sm",
    label: "Rishi Parampara",
    name: "Brahma → Vasishtha → Shakti → Parashara",
    desc: "The knowledge passed through the great Vedic seers across yugas.",
  },
  {
    size: "sm",
    label: null,
    name: "Veda Vyāsa → Shukadeva",
    desc: "Vyāsa compiled the Vedas into four, authored the Brahma Sūtras and the Mahābhārata. His son Shukadeva carried the teaching forward.",
  },
  {
    size: "sm",
    label: "Manava Parampara",
    name: "Gaudapāda → Govinda Bhagavatpāda",
    desc: "Gaudapāda authored the celebrated Kārikā on the Māṇḍukya Upanishad. His disciple Govinda Bhagavatpāda became the guru of Shankarāchārya.",
  },
  {
    size: "lg",
    label: "8th Century CE",
    name: "Adi Shankarāchārya",
    desc: "The most influential teacher of Advaita Vedanta. He wrote definitive commentaries on the Upanishads, Brahma Sūtras, and Bhagavad Gita, and established four mathas across India — Sringeri, Dvārakā, Puri, and Jyotirmath.",
  },
  {
    size: "sm",
    label: "Centuries of unbroken transmission",
    name: "The Dashanāmi Sampradāya",
    desc: "Through the four mathas and the Dashanāmi monastic orders, the teaching tradition continued across centuries, each generation receiving and transmitting the same vision of Vedanta.",
  },
  {
    size: "lg",
    label: "20th Century",
    name: "Swami Dayananda Saraswati",
    desc: "Founder of the Arsha Vidya tradition. A teacher of teachers who designed and taught seven long-term residential Vedanta courses and initiated over 200 disciples into sannyāsa, who now teach worldwide.",
    image: { src: "/images/swami-dayananda.jpg", alt: "Swami Dayananda Saraswati", style: "object-cover object-top" },
  },
  {
    size: "lg",
    label: "Present Day",
    name: "Swami Sachidānanda",
    desc: "Āchārya in the Arsha Vidya Parampara of Swami Dayananda Saraswati, and the teacher whose discourses form the foundation of this platform.",
    image: { src: "/images/swami-satchitananda.webp", alt: "Swami Sachidananda", style: "object-cover object-top" },
  },
] as const;

export function AboutParampara() {
  return (
    <section id="parampara" className="scroll-mt-20 bg-surface px-6 py-24 lg:px-20">
      <div className="mx-auto max-w-3xl">
        {/* Section header */}
        <div className="mb-14 text-center">
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.25em] text-tertiary">
            The Lineage
          </span>
          <h2 className="mb-4 font-serif text-4xl font-semibold text-primary">
            The Guru-Shishya Parampara
          </h2>
          <p className="mx-auto max-w-lg text-base font-light leading-relaxed text-on-surface-variant">
            Vedantic knowledge has been transmitted through an unbroken chain of
            teachers and students, beginning from the Lord himself and continuing
            to the present day.
          </p>
        </div>

        {/* Banner image */}
        <div className="relative mb-16 h-80 w-full overflow-hidden rounded-2xl md:h-96">
          <Image
            src="/images/guru-shishya-parampara.webp"
            alt="Swami Sachidananda paying respects in the Guru-Shishya tradition"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,25,23,0.6)] to-transparent" />
          <div className="absolute bottom-7 left-8 right-8 text-white">
            <p className="font-serif text-lg italic leading-relaxed">
              The living tradition — a disciple pays respects to his Guru,
              continuing the unbroken flow of Vedantic knowledge.
            </p>
            <span className="mt-2 block text-xs font-normal tracking-wide text-white/65">
              Guru-Shishya Parampara in practice
            </span>
          </div>
        </div>

        {/* Vertical timeline */}
        <div className="relative pl-12">
          {/* Vertical line */}
          <div
            className="absolute bottom-2 left-[15px] top-2 w-px"
            style={{
              background:
                "linear-gradient(180deg, var(--color-outline-variant), var(--color-primary), var(--color-outline-variant))",
            }}
          />

          {nodes.map((node, i) => (
            <div key={i} className="relative mb-10 last:mb-0">
              {/* Dot */}
              <div
                className={`absolute top-1 flex items-center justify-center rounded-full border-2 border-surface ${
                  node.size === "lg"
                    ? "-left-[39px] h-3.5 w-3.5 bg-primary"
                    : "-left-[37px] h-2.5 w-2.5 bg-tertiary"
                }`}
              />

              {"image" in node && node.image ? (
                <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
                  <div className="h-[100px] w-[80px] overflow-hidden rounded-lg border border-outline-variant">
                    <Image
                      src={node.image.src}
                      alt={node.image.alt}
                      width={80}
                      height={100}
                      className={`h-full w-full ${node.image.style}`}
                    />
                  </div>
                  <div>
                    {node.label && (
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.15em] text-tertiary">
                        {node.label}
                      </span>
                    )}
                    <h4 className="mb-2 font-serif text-[18px] font-semibold text-primary">
                      {node.name}
                    </h4>
                    <p className="text-sm font-light leading-[1.75] text-on-surface-variant">
                      {node.desc}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  {node.label && (
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.15em] text-tertiary">
                      {node.label}
                    </span>
                  )}
                  <h4 className="mb-2 font-serif text-xl font-semibold text-primary">
                    {node.name}
                  </h4>
                  <p className="text-sm font-light leading-[1.75] text-on-surface-variant">
                    {node.desc}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
