interface TeacherCardProps {
  name: string;
  title: string;
  quote: string;
  accentColor: "primary" | "secondary";
  rotateDirection: "positive" | "negative";
}

export function TeacherCard({
  name,
  title,
  quote,
  accentColor,
  rotateDirection,
}: TeacherCardProps) {
  const accentBg =
    accentColor === "primary"
      ? "bg-primary-container"
      : "bg-secondary-container";
  const rotate =
    rotateDirection === "positive"
      ? "rotate-6 group-hover:rotate-12"
      : "-rotate-6 group-hover:-rotate-12";

  return (
    <div className="group rounded-2xl bg-surface p-8 shadow-[0_2px_32px_rgba(30,27,19,0.06)] transition-shadow duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:shadow-[0_4px_32px_rgba(30,27,19,0.1)]">
      <div className="relative mb-6 h-24 w-24">
        <div
          className={`absolute inset-0 rounded-full ${accentBg} ${rotate} transition-transform duration-[var(--duration-base)] ease-[var(--ease-intentional)]`}
        />
        <div className="relative z-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-surface-container-high grayscale transition-all duration-[var(--duration-base)] ease-[var(--ease-intentional)] group-hover:grayscale-0">
          <span
            className="font-serif text-2xl text-on-surface-variant opacity-40"
            aria-hidden="true"
          >
            &#x0950;
          </span>
        </div>
      </div>
      <h4 className="mb-2 font-serif text-xl font-bold text-on-surface">
        {name}
      </h4>
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
        {title}
      </p>
      <p className="text-sm italic leading-relaxed text-on-surface-variant">
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}
