import { auth } from "@clerk/nextjs/server";
import { getUserRole, hasRole } from "@/lib/clerk";
import { GuideTabs } from "@/components/guide/guide-tabs";

/**
 * The Guide section holds two things that share a subject but not an audience:
 * a member's own conversation with their guide, and — for a teacher — the
 * students assigned to them. The tab strip appears only for teachers; a member
 * sees the page exactly as before.
 *
 * The tabs are presentational only. Each Students route carries its own server
 * guard, because /app/guide sits outside /app/admin and so middleware.ts does
 * not protect it.
 */
export default async function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const canTeach = hasRole(getUserRole(sessionClaims), ["teacher", "admin"]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      {canTeach && <GuideTabs />}
      {children}
    </div>
  );
}
