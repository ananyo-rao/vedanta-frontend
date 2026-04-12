import Image from "next/image";

export function AboutSwami() {
  return (
    <section id="swami-dayananda" className="scroll-mt-20 bg-surface px-6 py-24 lg:px-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-14 text-center">
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.25em] text-tertiary">
            The Founder
          </span>
          <h2 className="font-serif text-4xl font-semibold text-primary">
            Swami Dayananda Saraswati
          </h2>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[280px_1fr]">
          {/* Portrait */}
          <div className="mx-auto h-[370px] w-[280px] flex-shrink-0 overflow-hidden rounded-2xl border border-outline-variant">
            <Image
              src="/images/swami-dayananda.jpg"
              alt="Pūjya Swami Dayananda Saraswati"
              width={280}
              height={370}
              className="h-full w-full object-cover object-top"
              priority
            />
          </div>

          {/* Bio */}
          <div>
            <h3 className="font-serif text-2xl font-semibold text-primary">
              Pūjya Swami Dayananda Saraswati
            </h3>
            <p className="mt-1 text-sm font-medium text-tertiary">
              15 August 1930 — 23 September 2015
            </p>
            <p className="mb-5 mt-1 text-sm italic text-on-surface-variant">
              Founder, Arsha Vidyā Gurukulam
            </p>
            <div className="space-y-4">
              <p className="text-[15px] font-light leading-[1.85] text-on-surface-variant">
                Born as Natarajan in Manjakkudi, Thiruvarur district of Tamil
                Nadu, Swami Dayananda Saraswati was a traditional teacher of{" "}
                <strong className="font-medium text-on-surface">
                  Advaita Vedanta
                </strong>{" "}
                and a renunciate monk of the Hindu Saraswati order. His inner
                quest led him to Rishikesh, where he studied under Swami
                Chinmayananda, Swami Pranavananda, and Swami Tarananda Giri.
              </p>
              <p className="text-[15px] font-light leading-[1.85] text-on-surface-variant">
                A teacher of teachers, he designed and taught{" "}
                <strong className="font-medium text-on-surface">
                  seven long-term residential Vedanta courses
                </strong>
                , each spanning 30 to 36 months — five in India and two in the
                United States. Each course graduated approximately 60 qualified
                Āchāryas. Over 200 of his sannyāsi disciples now teach Vedanta
                and Pāṇinian grammar across the world.
              </p>
              <p className="text-[15px] font-light leading-[1.85] text-on-surface-variant">
                Beyond teaching, Swami Dayananda convened the{" "}
                <strong className="font-medium text-on-surface">
                  Āchārya Sabhā
                </strong>{" "}
                — uniting Hindu spiritual leaders — and founded the{" "}
                <strong className="font-medium text-on-surface">
                  All India Movement (AIM) for Seva
                </strong>
                , bringing education, healthcare, and infrastructure to remote
                villages across India.
              </p>
            </div>
            <span className="mt-5 inline-block rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-medium text-tertiary">
              Padma Bhushan (2016, posthumous)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
