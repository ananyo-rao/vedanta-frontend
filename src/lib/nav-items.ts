import { Video, User, Hammer, Code2, NotebookPen, Flame, type LucideIcon } from "lucide-react";
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
    icon: Video,
    label: "Live Sessions",
    href: "/app/dashboard",
    category: "SHRAVANAM",
  },
  {
    icon: NotebookPen,
    label: "My Journey",
    href: "/app/journey",
    category: "MANANAM",
  },
  {
    icon: Flame,
    label: "Tapas",
    href: "/app/tapas",
    category: "NIDHIYAASANAM",
  },
];

export const bottomTabItems: BottomTabItem[] = [
  { icon: Video, label: "Sessions", href: "/app/dashboard" },
  { icon: NotebookPen, label: "Journey", href: "/app/journey" },
  { icon: Hammer, label: "Builder", href: "/app/admin/course-builder", requiredRole: "admin" },
  { icon: User, label: "Profile", href: "/app/profile" },
];

export const homepageNavLinks = [
  { href: "#home", label: "Home" },
  { href: "#about-courses", label: "Courses" },
  { href: "#parampara", label: "About Us" },
];
