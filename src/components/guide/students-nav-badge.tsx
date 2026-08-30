"use client";

import { type LucideIcon } from "lucide-react";
import { SidebarItem } from "@/components/layout/sidebar-item";
import { useUnreadCount } from "@/hooks/use-guide-students";

/**
 * The Students nav item, with a live unread count.
 *
 * It exists as its own component so the polling hook is mounted only when the
 * item survives the role filter — a member's sidebar must not poll a teacher's
 * notification endpoint.
 */
export function StudentsNavItem(props: {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
  active?: boolean;
}) {
  const { data: count = 0 } = useUnreadCount();
  return <SidebarItem {...props} badgeCount={count} />;
}
