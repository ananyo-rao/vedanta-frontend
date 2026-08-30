import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AILMENT_COLORS, AILMENT_MAP } from "@/lib/ailments";

interface ElementBadgeProps {
  elementTag: string;
}

export function ElementBadge({ elementTag }: ElementBadgeProps) {
  const colorClass = AILMENT_COLORS[elementTag] ?? "bg-gray-100 text-gray-700";
  const label = AILMENT_MAP[elementTag]?.label ?? formatSlug(elementTag);

  return (
    <Badge className={cn(colorClass, "normal-case font-medium tracking-normal")}>
      {label}
    </Badge>
  );
}

function formatSlug(slug: string): string {
  return slug
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
