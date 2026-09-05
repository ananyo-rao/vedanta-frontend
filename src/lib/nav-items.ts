import { BookOpen, MessageCircle, User, Hammer, Code2, Sparkles, Compass, NotebookPen, GraduationCap, Users, Radio, type LucideIcon } from "lucide-react";
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
  /**
   * Roles allowed to see this item. An allow-list, not a hierarchy — an item
   * granted to ["teacher"] alone is hidden from admins. Omit for everyone.
   */
  roles?: Role[];
  external?: boolean;
}

export interface BottomTabItem {
  icon: LucideIcon;
  label: string;
  href: string;
  roles?: Role[];
}

export const sidebarNavItems: NavItem[] = [
  {
    icon: Hammer,
    label: "Course Builder",
    href: "/app/admin/course-builder",
    category: "BUILD",
    roles: ["admin"],
  },
  {
    icon: GraduationCap,
    label: "Teachings",
    href: "/app/admin/teachings",
    category: "BUILD",
    roles: ["admin"],
  },
  {
    icon: Radio,
    label: "Live Sessions",
    href: "/app/admin/sessions",
    category: "BUILD",
    roles: ["admin"],
  },
  {
    icon: Code2,
    label: "Developer Portal",
    href: DEVELOPER_PORTAL_URL,
    category: "BUILD",
    roles: ["admin"],
    external: true,
  },
  {
    icon: BookOpen,
    label: "Courses",
    href: "/app/dashboard",
    category: "LEARN",
  },
  {
    icon: Sparkles,
    label: "AI Chat",
    href: "/app/chat",
    category: "LEARN",
  },
  {
    icon: Compass,
    label: "Guide Chat",
    href: "/app/guide",
    category: "LEARN",
  },
  {
    icon: NotebookPen,
    label: "Journal",
    href: "/app/journal",
    category: "LEARN",
  },
  {
    icon: Radio,
    label: "Live Sessions",
    href: "/app/sessions",
    category: "LEARN",
  },
  {
    icon: Users,
    label: "Students",
    href: "/app/guide/students",
    category: "TEACH",
    roles: ["teacher", "admin"],
  },
];

export const bottomTabItems: BottomTabItem[] = [
  { icon: BookOpen, label: "Courses", href: "/app/dashboard" },
  { icon: Sparkles, label: "AI Chat", href: "/app/chat" },
  { icon: Hammer, label: "Builder", href: "/app/admin/course-builder", roles: ["admin"] },
  { icon: User, label: "Profile", href: "/app/profile" },
];

export const homepageNavLinks = [
  { href: "#home", label: "Home" },
  { href: "#about-courses", label: "Courses" },
  { href: "#parampara", label: "About Us" },
];
