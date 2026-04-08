import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { getUserRole } from "@/lib/clerk";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = getUserRole(sessionClaims);
  const userName = (sessionClaims?.firstName as string) || "";

  return (
    <div className="flex h-screen bg-surface">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar userName={userName} userRole={role} />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar userName={userName} userRole={role} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8" id="main-content">
        {children}
      </main>
    </div>
  );
}
