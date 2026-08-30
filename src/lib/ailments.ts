export interface Ailment {
  slug: string;
  label: string;
  icon: string;
  badgeColor: string;
}

export const AILMENTS: Ailment[] = [
  { slug: "hypertension", label: "Hypertension", icon: "❤️", badgeColor: "bg-red-100 text-red-700" },
  { slug: "diabetes", label: "Diabetes", icon: "💧", badgeColor: "bg-blue-100 text-blue-700" },
  { slug: "back_pain", label: "Back Pain", icon: "🦴", badgeColor: "bg-amber-100 text-amber-700" },
  { slug: "pph", label: "Promotion of Positive Health", icon: "🌿", badgeColor: "bg-green-100 text-green-700" },
];

export const AILMENT_MAP = Object.fromEntries(
  AILMENTS.map((a) => [a.slug, a])
) as Record<string, Ailment>;

export const AILMENT_COLORS = Object.fromEntries(
  AILMENTS.map((a) => [a.slug, a.badgeColor])
) as Record<string, string>;

export const AILMENT_FILTER_OPTIONS = [
  { value: "", label: "All" },
  ...AILMENTS.map((a) => ({ value: a.slug, label: a.label })),
];
