"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { History } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/app";

interface SessionData {
  id: string;
  status: string;
  last_active_at: string;
  expire_at: string;
  user_agent: string;
  client_ip: string;
}

interface LoginHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: string; name: string; email: string };
}

export function LoginHistorySheet({
  open,
  onOpenChange,
  user,
}: LoginHistorySheetProps) {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const fetchSessions = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(
          `${API_URL}/api/admin/users/${user.id}/sessions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch sessions");
        const data = await res.json();
        setSessions(data.data || []);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [open, user.id, getToken]);

  const parseUserAgent = (ua: string) => {
    if (!ua) return "Unknown device";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Browser";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{user.name || user.email}&apos;s Login History</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {loading ? (
            <p className="py-8 text-center text-sm text-on-surface-variant">
              Loading sessions...
            </p>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <History className="mb-4 h-8 w-8 text-on-surface-variant/40" />
              <p className="text-sm text-on-surface-variant">
                No session data available
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border border-outline-variant/10 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-on-surface">
                      {parseUserAgent(session.user_agent)}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        session.status === "active"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "text-on-surface-variant"
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="mt-1.5 text-xs text-on-surface-variant">
                    <p>
                      Last active:{" "}
                      {new Date(session.last_active_at).toLocaleString()}
                    </p>
                    {session.client_ip && <p>IP: {session.client_ip}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
