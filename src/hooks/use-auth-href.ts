import { useAuth } from "@clerk/nextjs";

export function useAuthHref(authenticatedPath = "/app/journey") {
  const { isSignedIn } = useAuth();
  return isSignedIn ? authenticatedPath : "/sign-in";
}
