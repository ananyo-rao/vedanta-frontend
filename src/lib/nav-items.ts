import { BookOpen, MessageCircle, User, type LucideIcon } from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
  category: string;
}

export interface BottomTabItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const sidebarNavItems: NavItem[] = [
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
  { icon: User, label: "Profile", href: "/app/profile" },
];

export const homepageNavLinks = [
  { href: "#home", label: "Home" },
  { href: "#about-courses", label: "Courses" },
  { href: "#about-vedanta", label: "About Us" },
];
