import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseIntroPage } from "@/components/course/course-intro-page";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { courseId } = await params;

  return <CourseIntroPage courseId={courseId} />;
}
