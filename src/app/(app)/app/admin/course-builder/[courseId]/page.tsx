import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/clerk";
import { AdminCourseEditor } from "@/components/admin/admin-course-editor";

interface EditCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");
  const role = getUserRole(sessionClaims);
  if (role !== "admin") redirect("/app/dashboard");

  const { courseId } = await params;

  return <AdminCourseEditor courseId={courseId} />;
}
