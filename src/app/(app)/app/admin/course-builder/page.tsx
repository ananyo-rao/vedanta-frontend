import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/clerk";
import { Hammer } from "lucide-react";

export default async function CourseBuilderPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  const role = getUserRole(sessionClaims);
  if (role !== "admin") redirect("/app/dashboard");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Hammer className="mb-6 h-12 w-12 text-on-surface-variant/40" />
      <h1 className="mb-3 font-serif text-2xl font-bold text-on-surface">
        Course Builder Coming Soon
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-on-surface-variant">
        You will be able to create and manage courses right from here. This
        feature is currently under development.
      </p>
    </div>
  );
}
