export type Role = "member" | "admin";

export function getUserRole(
  sessionClaims: Record<string, unknown> | null | undefined,
): Role {
  if (!sessionClaims) return "member";
  const metadata = sessionClaims.metadata as
    | Record<string, unknown>
    | undefined;
  if (!metadata) return "member";
  const role = metadata.role as string | undefined;
  if (role === "admin") return "admin";
  return "member";
}
