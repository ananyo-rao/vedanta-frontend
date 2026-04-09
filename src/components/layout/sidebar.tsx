"use client";

import { useRouter } from "next/navigation";
import { PanelLeftClose, PanelLeft, Settings, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarItem } from "@/components/layout/sidebar-item";
import { CategoryGroup } from "@/components/layout/category-group";
import { useSidebar } from "@/hooks/use-sidebar";
import { sidebarNavItems } from "@/lib/nav-items";
import type { Role } from "@/lib/clerk";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userName?: string;
  userRole?: Role;
  userEmail?: string;
  userImageUrl?: string;
}

export function Sidebar({
  userName,
  userRole,
  userEmail,
  userImageUrl,
}: SidebarProps) {
  const { collapsed, toggle } = useSidebar();
  const { signOut } = useClerk();
  const router = useRouter();

  const initials = (userName || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Filter nav items by role, then group by category
  const filteredItems = sidebarNavItems.filter(
    (item) => !item.requiredRole || item.requiredRole === userRole
  );
  const categories = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof filteredItems>
  );

  return (
    <aside
      aria-label="App navigation"
      className={cn(
        "flex h-full flex-col border-r border-outline-variant/10 bg-surface-container-low transition-all duration-[var(--duration-base)] ease-[var(--ease-intentional)]",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Branding + collapse toggle */}
      <div className="flex items-center justify-between px-3 py-4">
        {!collapsed && (
          <span className="font-serif text-base font-bold text-primary">
            Vedanta Academy
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-11 w-11 text-on-surface-variant hover:text-on-surface"
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation grouped by category */}
      <nav className="flex-1 overflow-y-auto px-2">
        {Object.entries(categories).map(([category, items]) =>
          collapsed ? (
            <div key={category} className="space-y-1 pt-4">
              {items.map((item) => (
                <SidebarItem key={item.href} {...item} />
              ))}
            </div>
          ) : (
            <CategoryGroup key={category} label={category}>
              {items.map((item) => (
                <SidebarItem key={item.href} {...item} />
              ))}
            </CategoryGroup>
          )
        )}
      </nav>

      {/* User section at bottom */}
      <Separator className="mx-3" />
      <div className={cn("px-3 py-4", collapsed ? "space-y-2" : "")}>
        {collapsed ? (
          /* Collapsed: avatar only + tooltip icons */
          <div className="flex flex-col items-center gap-2">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-default">
                    <AvatarImage src={userImageUrl} alt={userName || ""} />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initials || "U"}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {userName || "Profile"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-on-surface-variant hover:text-on-surface"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign Out</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          /* Expanded: full user info */
          <>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={userImageUrl} alt={userName || ""} />
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-on-surface">
                  {userName || "Student"}
                </p>
                <p className="truncate text-xs text-on-surface-variant">
                  {userEmail}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Settings"
                className="h-9 w-9 text-on-surface-variant hover:text-on-surface"
                onClick={() => router.push("/app/profile")}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                className="h-9 w-9 text-on-surface-variant hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
