"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { homepageNavLinks } from "@/lib/nav-items";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="px-6 py-5">
          <SheetTitle className="flex items-center gap-2.5">
            <Image
              src="/images/arsha-vidya-icon.png"
              alt="Vedanta Academy"
              width={28}
              height={28}
              className="rounded"
            />
            <span className="font-serif text-xl font-black tracking-tight text-primary">
              Vedanta Academy
            </span>
          </SheetTitle>
        </SheetHeader>
        <Separator />
        <nav className="flex flex-col gap-1 px-4 py-4">
          {homepageNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-[48px] items-center rounded-lg px-4 py-3 text-base font-medium text-on-surface-variant transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:bg-surface-container-high hover:text-on-surface"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Separator className="mx-4" />
        <div className="px-4 py-6">
          <Show when="signed-out">
            <Button asChild className="w-full" size="lg">
              <Link href="/sign-in">Login</Link>
            </Button>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </Show>
        </div>
      </SheetContent>
    </Sheet>
  );
}
