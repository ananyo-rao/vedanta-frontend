"use client";

import Link from "next/link";
import { Menu, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "#hero", label: "Home" },
  { href: "#courses", label: "Courses" },
  { href: "#about", label: "About" },
  { href: "#teachers", label: "Teachers" },
];

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-primary"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <Flower2 className="h-7 w-7 text-primary" />
            <span className="text-xl font-black text-primary tracking-tight font-serif">
              Vedanta Vidyalaya
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-3 text-base font-medium text-on-surface-variant transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:bg-surface-container-high hover:text-on-surface"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-6">
            <Button className="w-full" size="lg">
              Login
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
