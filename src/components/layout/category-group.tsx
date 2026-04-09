import { type ReactNode } from "react";

interface CategoryGroupProps {
  label: string;
  children: ReactNode;
}

export function CategoryGroup({ label, children }: CategoryGroupProps) {
  const labelId = `category-${label.toLowerCase()}`;

  return (
    <div role="group" aria-labelledby={labelId}>
      <p
        id={labelId}
        className="px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-widest text-on-surface-variant/60"
      >
        {label}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
