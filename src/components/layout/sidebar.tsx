"use client";

import { PanelLeftClose, PanelLeft } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SidebarItem } from "@/components/layout/sidebar-item";
import { useSidebar } from "@/hooks/use-sidebar";
import { sidebarNavItems } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userName?: string;
  userRole?: string;
}

export function Sidebar({ userName, userRole }: SidebarProps) {
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-surface-container-low transition-all duration-[var(--duration-base)] ease-[var(--ease-intentional)]",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between px-3 py-4">
        {!collapsed && (
          <span className="font-serif text-lg font-bold text-primary">VV</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-on-surface-variant hover:text-on-surface"
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {sidebarNavItems.map((item) => (
          <SidebarItem key={item.href} {...item} />
        ))}
      </nav>

      {/* User section at bottom */}
      <div
        className={cn(
          "border-t border-outline-variant/20 px-3 py-4",
          collapsed ? "flex justify-center" : "flex items-center gap-3"
        )}
      >
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
        {!collapsed && userName && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-on-surface">
              {userName}
            </p>
            {userRole && (
              <p className="text-xs capitalize text-on-surface-variant">
                {userRole}
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
