import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole, hasRole } from "@/lib/clerk";
import { StudentsList } from "@/components/guide/students-list";

export default async function StudentsPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  const role = getUserRole(sessionClaims);
  if (!hasRole(role, ["teacher", "admin"])) redirect("/app/dashboard");

  // An admin has no students of their own; they see every guide's students, so
  // the roster needs to say who guides each one.
  return <StudentsList supervising={role === "admin"} />;
}
