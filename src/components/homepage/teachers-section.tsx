import Link from "next/link";
import { Users } from "lucide-react";
import { TeacherCard } from "@/components/homepage/teacher-card";

const teachers = [
  {
    name: "Swami Satchitananda",
    title: "Senior Acharya",
    quote:
      "The purpose of Vedanta is not to give you something new, but to reveal that which you already possess.",
    accentColor: "primary" as const,
    rotateDirection: "positive" as const,
  },
  {
    name: "Acharya Maitreyi",
    title: "Sanskrit & Upanishad Specialist",
    quote:
      "In the depth of silence, the wisdom of the Vedas speaks most clearly to the pure heart.",
    accentColor: "secondary" as const,
    rotateDirection: "negative" as const,
  },
];

export function TeachersSection() {
  return (
    <section
      id="teachers"
      className="relative bg-surface-container-low px-6 py-24 lg:px-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16">
          <h3 className="mb-2 font-serif text-4xl font-bold tracking-tight text-on-surface">
            Your Teachers
          </h3>
          <p className="max-w-lg text-secondary">
            Guided by masters with decades of experience in the traditional
            parampara.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.name} {...teacher} />
          ))}

          {/* CTA Card */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-primary/5 p-8 text-center">
            <Users className="mb-4 h-10 w-10 text-primary" />
            <h4 className="mb-2 font-serif text-lg font-bold text-on-surface">
              Meet Our Full Faculty
            </h4>
            <p className="mb-6 px-4 text-sm text-on-surface-variant">
              Over 15 dedicated teachers across various Vedantic disciplines.
            </p>
            <Link
              href="#"
              className="font-bold text-primary transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:text-on-primary-container"
            >
              See all acharyas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
