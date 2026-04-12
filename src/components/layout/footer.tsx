"use client";

import Link from "next/link";
import { useAuthHref } from "@/hooks/use-auth-href";

export function Footer() {
  const appHref = useAuthHref();

  const links = [
    { href: appHref, label: "Courses" },
    { href: "#teachers", label: "Teachers" },
    { href: "#parampara", label: "About" },
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Contact Us" },
    { href: "#", label: "Terms" },
  ];

  return (
    <footer className="border-t border-outline-variant bg-surface-container-low px-6 py-12 lg:px-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 md:flex-row md:justify-between">
        <span className="font-serif text-lg font-semibold text-primary">
          Vedanta Vidyalaya
        </span>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-on-surface-variant transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-[11px] uppercase tracking-widest text-on-surface-variant/50">
        &copy; {new Date().getFullYear()} Vedanta Vidyalaya. All rights
        reserved.
      </p>
    </footer>
  );
}
