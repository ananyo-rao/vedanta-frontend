"use client";

import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarItem } from "@/components/layout/sidebar-item";
import { sidebarNavItems } from "@/lib/nav-items";

interface MobileSidebarProps {
  userName?: string;
  userRole?: string;
}

export function MobileSidebar({ userName, userRole }: MobileSidebarProps) {
  return (
    <div className="fixed left-4 top-4 z-50 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open navigation">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-surface-container-low p-0">
          <SheetHeader className="px-4 py-4">
            <SheetTitle className="font-serif text-lg font-bold text-primary">
              Vedanta Vidyalaya
            </SheetTitle>
          </SheetHeader>
          <nav className="flex-1 space-y-1 px-2">
            {sidebarNavItems.map((item) => (
              <SidebarItem key={item.href} {...item} />
            ))}
          </nav>
          <div className="mt-auto border-t border-outline-variant/20 px-4 py-4">
            <div className="flex items-center gap-3">
              <UserButton
                appearance={{ elements: { avatarBox: "h-8 w-8" } }}
              />
              {userName && (
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
