"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthHref } from "@/hooks/use-auth-href";

export function Footer() {
  const appHref = useAuthHref();

  const quickLinks = [
    { href: appHref, label: "Online Library" },
    { href: appHref, label: "Course Enrollment" },
    { href: appHref, label: "Student Login" },
  ];

  return (
    <footer className="bg-[#1e1b13] px-6 py-20 text-[#f8f0e1] lg:px-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-3">
        {/* Logo + Description (spans 2 cols) */}
        <div className="md:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <Image src="/images/arsha-vidya-icon.png" alt="Vedanta Academy" width={28} height={28} className="rounded" />
            <h2 className="font-serif text-2xl font-black tracking-tight">
              Vedanta Academy
            </h2>
          </div>
          <p className="mb-8 max-w-sm leading-relaxed text-[#dbc2b0]">
            A traditional sanctuary for study, reflection, and realization.
            Dedicated to preserving the authentic teachings of Advaita Vedanta
            for modern seekers.
          </p>
          <div className="text-4xl text-[#ff9762] opacity-40" aria-hidden="true">
            {/* Om symbol placeholder */}
            <span className="font-serif text-5xl">&#x0950;</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h5 className="mb-8 text-sm font-bold uppercase tracking-[0.2em] text-[#ffb693]">
            Quick Links
          </h5>
          <ul className="space-y-4 text-sm font-medium text-[#dbc2b0]">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:text-[#ff9762]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-16 flex max-w-7xl items-center justify-center border-t border-white/5 pt-8 text-[10px] uppercase tracking-widest text-[#6a5e33]">
        <p>&copy; {new Date().getFullYear()} Vedanta Academy. All rights reserved.</p>
      </div>
    </footer>
  );
}
