import { BookOpen, type LucideIcon } from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  active: boolean;
}

export const sidebarNavItems: NavItem[] = [
  { icon: BookOpen, label: "Courses", href: "/dashboard", active: true },
  // Future tabs will be added here
];
