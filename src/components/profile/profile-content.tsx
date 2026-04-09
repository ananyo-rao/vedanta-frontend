"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut, ChevronRight, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { Role } from "@/lib/clerk";

interface ProfileContentProps {
  userName: string;
  userEmail: string;
  userImageUrl: string;
  userRole: Role;
}

export function ProfileContent({
  userName,
  userEmail,
  userImageUrl,
  userRole,
}: ProfileContentProps) {
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-lg">
      {/* Profile header */}
      <div className="flex flex-col items-center py-8">
        <Avatar className="mb-4 h-20 w-20">
          <AvatarImage src={userImageUrl} alt={userName} />
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {initials || "U"}
          </AvatarFallback>
        </Avatar>
        <h1 className="font-serif text-xl font-bold text-on-surface">
          {userName || "Student"}
        </h1>
        <p className="text-sm text-on-surface-variant">{userEmail}</p>
      </div>

      <Separator />

      {/* Settings rows */}
      <div className="py-4">
        <button
          onClick={() => openUserProfile()}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <User className="h-5 w-5 text-on-surface-variant" />
          <span className="flex-1">Edit Profile</span>
          <ChevronRight className="h-4 w-4 text-on-surface-variant" />
        </button>
        <button
          onClick={() => setShowAccountSettings(!showAccountSettings)}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <Settings className="h-5 w-5 text-on-surface-variant" />
          <span className="flex-1">Account Settings</span>
          <ChevronRight className={`h-4 w-4 text-on-surface-variant transition-transform ${showAccountSettings ? "rotate-90" : ""}`} />
        </button>

        {/* Account Settings panel */}
        {showAccountSettings && (
          <div className="mx-4 mt-2 rounded-lg bg-surface-container-low p-4">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-on-surface">
                Role &amp; Permissions
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-surface-container px-3 py-2">
              <span className="text-sm text-on-surface-variant">
                Current Role
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold capitalize text-primary">
                {userRole}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
              Role and permission management is coming soon. Contact your
              administrator to update your role.
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Sign out */}
      <div className="py-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-error-container/30"
        >
          <LogOut className="h-5 w-5" />
          <span className="flex-1">Sign Out</span>
          <ChevronRight className="h-4 w-4 text-on-surface-variant" />
        </button>
      </div>
    </div>
  );
}
