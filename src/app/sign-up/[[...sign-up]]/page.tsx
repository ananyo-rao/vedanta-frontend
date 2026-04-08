import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <SignUp
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
