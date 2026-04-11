import Image from "next/image";

export function AboutParampara() {
  return (
    <section id="parampara" className="scroll-mt-20 bg-surface px-6 py-24 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          {/* Visual element on left */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="h-80 w-80 overflow-hidden rounded-2xl bg-surface-container shadow-[0_4px_32px_rgba(30,27,19,0.10)]">
                <Image
                  src="/images/guru-shishya-parampara.webp"
                  alt="Guru-Shishya Parampara — the unbroken teaching lineage of Arsha Vidya"
                  width={320}
                  height={320}
                  className="h-full w-full object-cover"
                />
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
              This lineage stretches back thousands of years — from the great Adi
              Shankaracharya through generations of dedicated acharyas. The Arsha
              Vidya tradition, established by Pujya Swami Dayananda Saraswati,
              continues this sacred transmission. At Vedanta Academy, we honour
              this lineage through the personal, dialogue-based method of teaching
              that allows each student to progress in their own understanding.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
