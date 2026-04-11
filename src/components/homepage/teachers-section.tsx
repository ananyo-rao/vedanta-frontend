import Image from "next/image";

export function TeachersSection() {
  return (
    <section
      id="teachers"
      className="scroll-mt-20 relative bg-surface-container-low px-6 py-24 lg:px-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-tertiary">
            Your Teacher
          </span>
          <h3 className="mb-2 font-serif text-4xl font-bold tracking-tight text-on-surface">
            Swami Satchitananda
          </h3>
          <p className="max-w-lg text-secondary">
            Disciple of Pujya Swami Dayananda Saraswati, Acharya of Arsha Vidya,
            carrying forward the teaching tradition of the Guru-Shishya parampara.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
          {/* Portrait */}
          <div className="flex items-center justify-start">
            <div className="relative">
              <div className="h-96 w-72 overflow-hidden rounded-2xl bg-surface-container-highest shadow-[0_4px_32px_rgba(30,27,19,0.10)]">
                <Image
                  src="/images/swami-satchitananda.webp"
                  alt="Swami Satchitananda — Acharya, Arsha Vidya"
                  width={288}
                  height={384}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-xl bg-primary-container opacity-50" />
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col justify-center">
            <p className="mb-6 text-base leading-[1.6] text-on-surface-variant">
              Swami Sachidananda is a disciple of Pujya Swami Dayananda
              Saraswati. He studied Vedanta at Arsha Vidya Gurukulam in
              Coimbatore and Swami Dayananda Ashram in Rishikesh. His seva to
              Pujya Swamiji with dedication and love is a well-known fact among
              Arsha Vidya disciples.
            </p>
            <p className="mb-6 text-base leading-[1.6] text-on-surface-variant">
              Swamiji teaches Vedanta and meditation at Arsha Vidya Gurukulam,
              U.S.A. and Arsha Vidya Kendra, Bangalore. He is known for his
              simple and clear exposition of the vision of Vedanta, making him
              accessible to modern audiences. He has also conducted Vedanta
              Retreats at Swami Dayananda Ashram, Arsha Vidya Gurukulam
              Coimbatore, and other places in Karnataka, and is the head of Sri
              Vasavi Peetam.
            </p>
            <p className="mb-6 text-base leading-[1.6] text-on-surface-variant">
              A multifaceted, friendly sannyasi, Swami Sachidanandaji is known
              for his singing of Carnatic music, bhajans, chants, and playing
              the veena, which adds joy to satsangs. He offers classes, public
              lectures, retreats, and social service activities through Arsha
              Vidya Kendra, Bangalore, and is available for satsangs at homes
              and other venues upon request, as well as online classes on Zoom.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
