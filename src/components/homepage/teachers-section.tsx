import { TeacherCard } from "@/components/homepage/teacher-card";

export function TeachersSection() {
  return (
    <section
      id="swami-satchitananda"
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
            The current Acharya of Arsha Vidya, carrying forward the teaching
            tradition of Pujya Swami Dayananda Saraswati.
          </p>
        </div>

        <div className="max-w-md">
          <TeacherCard
            name="Swami Satchitananda"
            title="Acharya, Arsha Vidya"
            quote="The purpose of Vedanta is not to give you something new, but to reveal that which you already possess."
            accentColor="primary"
            rotateDirection="positive"
          />
        </div>
      </div>
    </section>
  );
}
