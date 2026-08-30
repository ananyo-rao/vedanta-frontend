"use client";

import { Video } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Video className="h-7 w-7 text-primary" />
      </div>
      <h1 className="font-serif text-2xl font-bold text-on-surface">
        Live Sessions
      </h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        Coming soon. Live courses will be available here.
      </p>
    </div>
  );
}
