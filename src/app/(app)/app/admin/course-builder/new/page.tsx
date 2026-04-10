import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/clerk";
import { NewCourseForm } from "@/components/admin/new-course-form";

export default async function NewCoursePage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  const role = getUserRole(sessionClaims);
  if (role !== "admin") redirect("/app/dashboard");

  return <NewCourseForm />;
}
