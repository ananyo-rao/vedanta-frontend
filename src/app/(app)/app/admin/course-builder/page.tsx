import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/clerk";
import { AdminCourseList } from "@/components/admin/admin-course-list";

export default async function CourseBuilderPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  const role = getUserRole(sessionClaims);
  if (role !== "admin") redirect("/app/dashboard");

  return <AdminCourseList />;
}
