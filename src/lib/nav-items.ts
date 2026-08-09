import { BookOpen, MessageCircle, User, Hammer, Code2, type LucideIcon } from "lucide-react";
import type { Role } from "@/lib/clerk";

// The Dharma Sadhana developer portal (a separate app). Admins get a link to it
// from the sidebar. Overridable via env; falls back to the deployed URL.
const DEVELOPER_PORTAL_URL =
  process.env.NEXT_PUBLIC_DEVELOPER_PORTAL_URL ||
  "https://dharma-sadhana-frontend-m73slm6i6q-el.a.run.app/developer";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
  category: string;
  requiredRole?: Role;
  external?: boolean;
}

export interface BottomTabItem {
  icon: LucideIcon;
  label: string;
  href: string;
  requiredRole?: Role;
}

export const sidebarNavItems: NavItem[] = [
  {
    icon: Hammer,
    label: "Course Builder",
    href: "/app/admin/course-builder",
    category: "BUILD",
    requiredRole: "admin",
  },
  {
    icon: Code2,
    label: "Developer Portal",
    href: DEVELOPER_PORTAL_URL,
    category: "BUILD",
    requiredRole: "admin",
    external: true,
  },
  {
    icon: BookOpen,
    label: "Courses",
    href: "/app/dashboard",
    category: "LEARN",
  },
  {
    icon: MessageCircle,
    label: "Mentorship",
    href: "/app/mentorship",
    category: "LEARN",
    badge: "Soon",
  },
];

export const bottomTabItems: BottomTabItem[] = [
  { icon: BookOpen, label: "Courses", href: "/app/dashboard" },
  { icon: MessageCircle, label: "Mentorship", href: "/app/mentorship" },
  { icon: Hammer, label: "Builder", href: "/app/admin/course-builder", requiredRole: "admin" },
  { icon: User, label: "Profile", href: "/app/profile" },
];

export const homepageNavLinks = [
  { href: "#home", label: "Home" },
  { href: "#about-courses", label: "Courses" },
  { href: "#parampara", label: "About Us" },
];
