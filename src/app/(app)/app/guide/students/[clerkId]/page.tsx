import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole, hasRole } from "@/lib/clerk";
import { StudentDetailView } from "@/components/guide/student-detail-view";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ clerkId: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  if (!hasRole(getUserRole(sessionClaims), ["teacher", "admin"]))
    redirect("/app/dashboard");

  const { clerkId } = await params;
  return <StudentDetailView clerkId={clerkId} />;
}
