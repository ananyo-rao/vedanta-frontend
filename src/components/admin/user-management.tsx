"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Shield,
  UserX,
  UserCheck,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteUserDialog } from "@/components/admin/invite-user-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { LoginHistorySheet } from "@/components/admin/login-history-sheet";

interface User {
  id: string;
  clerk_id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/app";

export function UserManagement() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    user: User;
    type: "role" | "status";
    newValue: string;
    title: string;
    description: string;
  } | null>(null);
  const [historyUser, setHistoryUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        page: String(pagination.page),
        per_page: "20",
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      });

      const res = await fetch(`${API_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
      const data = await res.json();
      setUsers(data.data || []);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [getToken, pagination.page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleRoleChange = (user: User) => {
    const newRole = user.role === "admin" ? "member" : "admin";
    setConfirmAction({
      user,
      type: "role",
      newValue: newRole,
      title: `Change ${user.name || user.email}'s role to ${newRole}?`,
      description:
        "Changes take effect on their next login. Their current session will not be affected.",
    });
  };

  const handleStatusChange = (user: User) => {
    const newStatus = user.status === "active" ? "deactivated" : "active";
    const isDeactivating = newStatus === "deactivated";
    setConfirmAction({
      user,
      type: "status",
      newValue: newStatus,
      title: isDeactivating
        ? `Deactivate ${user.name || user.email}?`
        : `Reactivate ${user.name || user.email}?`,
      description: isDeactivating
        ? "This will immediately prevent them from logging in."
        : "This will allow them to log in again.",
    });
  };

  const executeConfirm = async () => {
    if (!confirmAction) return;
    const { user, type, newValue } = confirmAction;

    try {
      const token = await getToken();
      const endpoint =
        type === "role"
          ? `${API_URL}/api/admin/users/${user.id}/role`
          : `${API_URL}/api/admin/users/${user.id}/status`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(type === "role" ? { role: newValue } : { status: newValue }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Operation failed");
      }

      toast.success(
        type === "role"
          ? `Role changed to ${newValue}`
          : newValue === "deactivated"
            ? "User deactivated"
            : "User reactivated"
      );
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setConfirmAction(null);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">
            User Management
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {pagination.total} users total
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-low py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Search users"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      <Separator className="mb-4" />

      {/* User list */}
      {loading ? (
        <div className="py-16 text-center text-sm text-on-surface-variant">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center text-sm text-on-surface-variant">
          No users found
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-outline-variant/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                  User
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-on-surface-variant md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                  Role
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-on-surface-variant sm:table-cell">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-on-surface-variant lg:table-cell">
                  Last Active
                </th>
                <th className="px-4 py-3 text-right font-medium text-on-surface-variant">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const initials = (user.name || user.email[0])
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr
                    key={user.id}
                    className="border-b border-outline-variant/5 hover:bg-surface-container-low/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatar_url || undefined}
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-on-surface">
                          {user.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-on-surface-variant md:table-cell">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "outline"
                        }
                        className="text-[10px]"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <Badge
                        variant="outline"
                        className={
                          user.status === "active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-on-surface-variant lg:table-cell">
                      {formatRelativeTime(user.updated_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Actions for ${user.name || user.email}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {user.role === "admin"
                              ? "Change to Member"
                              : "Change to Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user)}
                          >
                            {user.status === "active" ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Reactivate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setHistoryUser(user)}
                          >
                            <History className="mr-2 h-4 w-4" />
                            View Login History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-on-surface-variant">
          <span>
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((p) => ({ ...p, page: p.page - 1 }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.total_pages}
              onClick={() =>
                setPagination((p) => ({ ...p, page: p.page + 1 }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={fetchUsers}
      />

      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={() => setConfirmAction(null)}
          title={confirmAction.title}
          description={confirmAction.description}
          onConfirm={executeConfirm}
        />
      )}

      {historyUser && (
        <LoginHistorySheet
          open={!!historyUser}
          onOpenChange={() => setHistoryUser(null)}
          user={historyUser}
        />
      )}
    </div>
  );
}
