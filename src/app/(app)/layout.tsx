import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";


export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const userName = user?.firstName || "";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
  const userImageUrl = user?.imageUrl || "";

  return (
    <div className="flex h-screen bg-surface">
      {/* Desktop + Tablet sidebar (hidden on mobile) */}
      <div className="hidden sm:block">
        <Sidebar
          userName={userName}
          userEmail={userEmail}
          userImageUrl={userImageUrl}
        />
      </div>

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto p-6 pb-24 sm:pb-6 lg:p-8"
        id="main-content"
      >
        {children}
      </main>

      {/* Mobile bottom tab bar (hidden on sm+) */}
      <BottomTabBar />
    </div>
  );
}
