import Link from "next/link";
import { Flower2, Send } from "lucide-react";

const quickLinks = [
  { href: "#", label: "Online Library" },
  { href: "#", label: "Weekly Satsanga" },
  { href: "#", label: "Course Enrollment" },
  { href: "#", label: "Student Login" },
];

const bottomLinks = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Contact Us" },
];

export function Footer() {
  return (
    <footer className="bg-[#1e1b13] px-6 py-20 text-[#f8f0e1] lg:px-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
        {/* Logo + Description (spans 2 cols) */}
        <div className="md:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <Flower2 className="h-7 w-7 text-[#ff9762]" />
            <h2 className="font-serif text-2xl font-black tracking-tight">
              Vedanta Vidyalaya
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

        {/* Newsletter */}
        <div>
          <h5 className="mb-8 text-sm font-bold uppercase tracking-[0.2em] text-[#ffb693]">
            Newsletter
          </h5>
          <p className="mb-6 text-xs text-[#dbc2b0]">
            Receive wisdom bites and course updates directly in your inbox.
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Email address"
              aria-label="Email address for newsletter"
              className="w-full rounded-l-md bg-[#2a271f] px-4 py-2 text-sm text-[#f8f0e1] placeholder-[#887364] focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              className="rounded-r-md bg-primary px-4 py-2 text-on-primary transition-opacity hover:opacity-90"
              aria-label="Subscribe to newsletter"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-[10px] uppercase tracking-widest text-[#6a5e33] md:flex-row">
        <p>&copy; {new Date().getFullYear()} Vedanta Vidyalaya Academy. All rights reserved.</p>
        <div className="flex gap-8">
          {bottomLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors duration-[var(--duration-base)] ease-[var(--ease-intentional)] hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
