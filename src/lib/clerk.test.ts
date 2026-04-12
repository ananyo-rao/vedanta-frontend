import { describe, it, expect } from "vitest";
import { getUserRole } from "./clerk";

describe("getUserRole", () => {
  it("returns 'member' when sessionClaims is null", () => {
    expect(getUserRole(null)).toBe("member");
  });

  it("returns 'member' when sessionClaims is undefined", () => {
    expect(getUserRole(undefined)).toBe("member");
  });

  it("returns 'member' when metadata is missing", () => {
    expect(getUserRole({})).toBe("member");
  });

  it("returns 'member' when metadata has no role", () => {
    expect(getUserRole({ metadata: {} })).toBe("member");
  });

  it("returns 'admin' when role is admin", () => {
    expect(getUserRole({ metadata: { role: "admin" } })).toBe("admin");
  });

  it("returns 'member' when role is member", () => {
    expect(getUserRole({ metadata: { role: "member" } })).toBe("member");
  });

  it("returns 'member' for unknown role values", () => {
    expect(getUserRole({ metadata: { role: "superadmin" } })).toBe("member");
  });

  it("returns 'member' when metadata is a non-object", () => {
    expect(getUserRole({ metadata: "string-value" })).toBe("member");
  });
});
