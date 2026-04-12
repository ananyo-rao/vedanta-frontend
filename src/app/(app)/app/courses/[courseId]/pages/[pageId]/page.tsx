import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CoursePageContent } from "@/components/course/course-page-content";

interface PageProps {
  params: Promise<{ courseId: string; pageId: string }>;
}

export default async function CoursePlayerPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { courseId, pageId } = await params;

  return <CoursePageContent courseId={courseId} pageId={pageId} />;
}
