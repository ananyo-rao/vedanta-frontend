import Link from "next/link";
import { Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";

const navLinks = [
  { href: "#hero", label: "Home", active: true },
  { href: "#courses", label: "Courses", active: false },
  { href: "#about", label: "About", active: false },
  { href: "#teachers", label: "Teachers", active: false },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between bg-surface/95 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Flower2 className="h-7 w-7 text-primary" />
        <Link
          href="/"
          className="font-serif text-xl font-black tracking-tight text-primary"
        >
          Vedanta Vidyalaya
        </Link>
      </div>

      <nav className="hidden items-center gap-8 md:flex">
        {navLinks.map((link) =>
          link.active ? (
            <Link
              key={link.href}
              href={link.href}
              className="border-b-2 border-primary py-1 font-medium text-primary"
            >
              {link.label}
            </Link>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1 text-secondary transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:bg-surface-container-high"
            >
              {link.label}
            </Link>
          )
        )}
      </nav>

      <div className="flex items-center gap-4">
        <Button className="hidden md:inline-flex">Login</Button>
        <MobileNav />
      </div>
    </header>
  );
}
