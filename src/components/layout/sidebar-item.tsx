"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
  /**
   * Live count rendered as an alert badge — unlike `badge`, which is a static
   * label baked into the nav definition.
   */
  badgeCount?: number;
  external?: boolean;
  /**
   * Explicit active state. The parent resolves this when items nest, so that
   * only the most specific match highlights. Falls back to prefix matching.
   */
  active?: boolean;
}

export function SidebarItem({
  icon: Icon,
  label,
  href,
  badge,
  badgeCount,
  external,
  active: activeProp,
}: SidebarItemProps) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const active =
    activeProp ?? (!external && pathname.startsWith(href));
  const hasCount = typeof badgeCount === "number" && badgeCount > 0;

  const link = (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)]",
        active
          ? "bg-primary/8 text-primary"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      )}
    >
      <span className="relative flex-shrink-0">
        <Icon className="h-5 w-5" />
        {/* When collapsed there is no room for a number, but a teacher must
            still be able to tell that someone is waiting on them. */}
        {hasCount && collapsed && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary"
          />
        )}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {hasCount && (
            <Badge className="ml-auto bg-primary px-1.5 py-0 text-[10px] text-white">
              {badgeCount}
            </Badge>
          )}
          {!hasCount && badge && (
            <Badge
              variant="outline"
              className="ml-auto px-1.5 py-0 text-[10px]"
            >
              {badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return link;
}
