import Image from "next/image";

export function AboutSwami() {
  return (
    <section id="swami-dayananda" className="scroll-mt-20 bg-surface-container-low px-6 py-24 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div className="asymmetric-gutter">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
              Our Paramaguru
            </span>
            <h3 className="mb-6 font-serif text-4xl font-bold tracking-tight text-on-surface">
              Swami Dayananda Saraswati
            </h3>
            <p className="mb-6 text-base leading-[1.6] text-on-surface-variant">
              Pujya Swami Dayananda Saraswati was one of the foremost traditional
              teachers of Advaita Vedanta of our time. With over five decades of
              teaching — beginning internationally in 1976 — he dedicated his life
              to making the timeless wisdom of the Vedas accessible to seekers
              across the world.
            </p>
            <p className="mb-6 text-base leading-[1.6] text-on-surface-variant">
              Founder of Arsha Vidya Gurukulam, Swamiji
              addressed the United Nations, UNESCO, and the Millennium World Peace
              Summit. He attained Mahasamadhi in 2015, leaving behind an
              unbroken lineage of dedicated teachers who carry forward his vision.
            </p>
            <blockquote className="rounded-xl bg-surface-container p-6">
              <p className="font-serif text-lg italic leading-relaxed text-on-surface">
                &ldquo;If you are seeking the limitless as something other than
                yourself, you seek limitlessly.&rdquo;
              </p>
              <footer className="mt-3 text-xs font-bold uppercase tracking-widest text-primary">
                &mdash; Pujya Swami Dayananda Saraswati
              </footer>
            </blockquote>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="h-96 w-80 overflow-hidden rounded-2xl bg-surface-container-highest">
                <Image
                  src="/images/swami-dayananda.jpg"
                  alt="Pujya Swami Dayananda Saraswati"
                  width={320}
                  height={384}
                  className="h-full w-full object-cover object-top"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-xl bg-tertiary-container opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
