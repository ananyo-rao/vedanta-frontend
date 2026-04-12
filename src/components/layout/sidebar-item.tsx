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
}

export function SidebarItem({
  icon: Icon,
  label,
  href,
  badge,
}: SidebarItemProps) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const active = pathname.startsWith(href);

  const link = (
    <Link
      href={href}
      className={cn(
        "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)]",
        active
          ? "bg-primary/8 text-primary"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && (
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
