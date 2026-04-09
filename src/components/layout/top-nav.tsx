"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useActiveSection } from "@/hooks/use-active-section";
import { homepageNavLinks } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

export function TopNav() {
  const activeSection = useActiveSection();
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between bg-surface/95 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center">
        <Link
          href="/"
          className="font-serif text-xl font-black tracking-tight text-primary"
        >
          Vedanta Academy
        </Link>
      </div>

      <nav className="hidden items-center gap-1 md:flex">
        {homepageNavLinks.map((link) => {
          const sectionId = link.href.replace("#", "");
          const isActive = activeSection === sectionId;

          return (
            <a
              key={link.href}
              href={link.href}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "rounded-lg px-4 py-2 text-base font-medium transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)]",
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              {link.label}
            </a>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        {isLoaded && isSignedIn ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        ) : (
          <Button asChild>
            <Link href="/sign-in">Login</Link>
          </Button>
        )}
        <MobileNav />
      </div>
    </header>
  );
}
