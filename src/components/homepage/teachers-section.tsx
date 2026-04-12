import Image from "next/image";

export function TeachersSection() {
  return (
    <section
      id="teachers"
      className="scroll-mt-20 bg-surface-container-low px-6 py-24 lg:px-20"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-14 text-center">
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.25em] text-tertiary">
            Your Āchārya
          </span>
          <h2 className="font-serif text-4xl font-semibold text-primary">
            Swami Sachidānanda
          </h2>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[280px_1fr]">
          {/* Portrait */}
          <div className="mx-auto h-[370px] w-[280px] flex-shrink-0 overflow-hidden rounded-2xl border border-outline-variant">
            <Image
              src="/images/swami-satchitananda.webp"
              alt="Swami Sachidānanda — Āchārya, Arsha Vidyā"
              width={280}
              height={370}
              className="h-full w-full object-cover object-top"
            />
          </div>

          {/* Bio */}
          <div>
            <h3 className="font-serif text-2xl font-semibold text-primary">
              Swami Sachidānanda
            </h3>
            <p className="mb-5 mt-1 text-sm italic text-on-surface-variant">
              Āchārya, Arsha Vidyā Parampara
            </p>
            <div className="space-y-4">
              <p className="text-[15px] font-light leading-[1.85] text-on-surface-variant">
                Swami Sachidānanda is a teacher of Vedanta in the tradition of{" "}
                <strong className="font-medium text-on-surface">
                  Swami Dayananda Saraswati&rsquo;s Arsha Vidyā Parampara
                </strong>
                . His discourses — rooted in the systematic unfolding of the
                Prasth&#x101;natraya (Upanishads, Bhagavad Gita, and Brahma
                Sūtras) — form the foundation of the courses offered on this
                platform.
              </p>
              <p className="text-[15px] font-light leading-[1.85] text-on-surface-variant">
                He studied Vedanta at Arsha Vidyā Gurukulam in Coimbatore and
                Swami Dayananda Ashram in Rishikesh. Swamiji teaches Vedanta and
                meditation at Arsha Vidyā Gurukulam, U.S.A. and Arsha Vidyā
                Kendra, Bangalore, and is known for his simple and clear
                exposition of the vision of Vedanta.
              </p>
              <p className="text-[15px] font-light leading-[1.85] text-on-surface-variant">
                Through Vedanta Vidyalaya, Swami Sachidānanda&rsquo;s teachings
                are made accessible to seekers worldwide — preserving the
                traditional method of{" "}
                <strong className="font-medium text-on-surface">shravana</strong>{" "}
                (listening),{" "}
                <strong className="font-medium text-on-surface">manana</strong>{" "}
                (reflection), and{" "}
                <strong className="font-medium text-on-surface">
                  nididhyāsana
                </strong>{" "}
                (contemplation), now available through structured online courses,
                live sessions, and guided self-inquiry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
