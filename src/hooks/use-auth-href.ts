import { useAuth } from "@clerk/nextjs";

export function useAuthHref(authenticatedPath = "/app/dashboard") {
  const { isSignedIn } = useAuth();
  return isSignedIn ? authenticatedPath : "/sign-in";
}
