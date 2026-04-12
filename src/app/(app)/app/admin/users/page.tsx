import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/clerk";
import { UserManagement } from "@/components/admin/user-management";

export default async function UserManagementPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  const role = getUserRole(sessionClaims);
  if (role !== "admin") redirect("/app/dashboard");

  return <UserManagement />;
}
