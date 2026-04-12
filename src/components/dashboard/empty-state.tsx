import { BookOpen } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
        <BookOpen className="h-8 w-8 text-on-surface-variant" />
      </div>
      <h3 className="mb-2 font-serif text-xl font-bold text-on-surface">
        No courses available yet
      </h3>
      <p className="max-w-md text-sm leading-relaxed text-on-surface-variant">
        New courses are being prepared. Check back soon for guided learning in
        Advaita Vedanta, Bhagavad Gita, and meditation.
      </p>
    </div>
  );
}
