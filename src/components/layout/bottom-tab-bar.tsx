"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomTabItems } from "@/lib/nav-items";
import type { Role } from "@/lib/clerk";
import { cn } from "@/lib/utils";

interface BottomTabBarProps {
  userRole?: Role;
}

export function BottomTabBar({ userRole }: BottomTabBarProps) {
  const pathname = usePathname();

  const filteredItems = bottomTabItems.filter(
    (item) => !item.requiredRole || item.requiredRole === userRole
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant/10 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm sm:hidden"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex h-[60px] items-center justify-around">
        {filteredItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-1 px-2 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
