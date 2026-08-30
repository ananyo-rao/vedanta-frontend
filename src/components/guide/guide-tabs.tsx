"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/app/guide", label: "My Guide", icon: Compass, exact: true },
  { href: "/app/guide/students", label: "Students", icon: Users, exact: false },
];

/**
 * URL-driven tabs rather than Radix Tabs: each view is a real route, so a
 * notification can deep-link to one student and the back button behaves.
 */
export function GuideTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Guide sections"
      className="mb-5 flex gap-1 border-b border-outline-variant/10"
    >
      {tabs.map(({ href, label, icon: Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px flex min-h-[44px] items-center gap-2 border-b-2 px-4 text-sm font-medium transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
