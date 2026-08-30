export type Role = "student" | "teacher" | "admin";

const ROLES: readonly Role[] = ["student", "teacher", "admin"] as const;

/**
 * Role spellings that may still sit in Clerk publicMetadata, mapped onto the
 * current vocabulary. Clerk is external state no migration can rewrite
 * transactionally, so anyone explicitly set to "member" before the rename keeps
 * working rather than silently falling back to the default.
 */
const LEGACY_ALIASES: Record<string, Role> = { member: "student" };

/**
 * Resolve the caller's role from their Clerk session claims.
 *
 * Everyone is a student unless they have been made a teacher or an admin, and
 * anything unrecognised falls back to student — the least-privileged role —
 * rather than being trusted.
 */
export function getUserRole(
  sessionClaims: Record<string, unknown> | null | undefined,
): Role {
  if (!sessionClaims) return "student";
  const metadata = sessionClaims.metadata as
    | Record<string, unknown>
    | undefined;
  if (!metadata) return "student";
  const raw = metadata.role as string | undefined;
  if (!raw) return "student";
  const role = LEGACY_ALIASES[raw] ?? raw;
  return ROLES.includes(role as Role) ? (role as Role) : "student";
}

/**
 * Allow-list check used by nav filtering and page guards.
 *
 * Deliberately not a hierarchy: an admin is not implicitly a teacher. Where an
 * admin should see teacher UI, list both roles explicitly, so every grant is
 * visible at the point it is made.
 */
export function hasRole(role: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(role);
}
