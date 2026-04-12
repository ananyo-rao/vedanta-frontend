import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:opacity-90",
            card: "shadow-none",
          },
        }}
      />
    </div>
  );
}
