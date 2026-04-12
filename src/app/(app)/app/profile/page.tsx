import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/profile/profile-content";
import { getUserRole } from "@/lib/clerk";

export default async function ProfilePage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
  const userImageUrl = user?.imageUrl || "";
  const userRole = getUserRole(sessionClaims);

  return (
    <ProfileContent
      userName={userName}
      userEmail={userEmail}
      userImageUrl={userImageUrl}
      userRole={userRole}
    />
  );
}
