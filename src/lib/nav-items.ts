import { BookOpen, MessageCircle, User, Hammer, type LucideIcon } from "lucide-react";
import type { Role } from "@/lib/clerk";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
  category: string;
  requiredRole?: Role;
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
