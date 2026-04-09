import { MessageCircle } from "lucide-react";

export default function MentorshipPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <MessageCircle className="mb-6 h-12 w-12 text-on-surface-variant/40" />
      <h1 className="mb-3 font-serif text-2xl font-bold text-on-surface">
        Mentorship Coming Soon
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-on-surface-variant">
        We are preparing a personal mentorship experience to guide your Vedantic
        study. Connect with experienced teachers for one-on-one guidance on your
        learning journey. This will be available soon.
      </p>
    </div>
  );
}
