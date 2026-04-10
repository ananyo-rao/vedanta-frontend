import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CompletePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseCompletePage({ params }: CompletePageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await params;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="mb-4 font-serif text-3xl font-bold text-on-surface">
        Course Complete
      </h1>
      <p className="mb-8 max-w-md text-base leading-relaxed text-on-surface-variant">
        May the teachings guide your continued practice.
      </p>
      <Button asChild>
        <Link href="/app/dashboard">Return to Courses</Link>
      </Button>
    </div>
  );
}
