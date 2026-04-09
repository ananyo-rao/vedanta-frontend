import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/profile/profile-content";

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const userName = user?.firstName || "";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
  const userImageUrl = user?.imageUrl || "";

  return (
    <ProfileContent
      userName={userName}
      userEmail={userEmail}
      userImageUrl={userImageUrl}
    />
  );
}
