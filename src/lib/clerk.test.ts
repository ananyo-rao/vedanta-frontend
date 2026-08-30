import { describe, it, expect } from "vitest";
import { getUserRole, hasRole } from "./clerk";

describe("getUserRole", () => {
  it("returns 'student' when sessionClaims is null", () => {
    expect(getUserRole(null)).toBe("student");
  });

  it("returns 'student' when sessionClaims is undefined", () => {
    expect(getUserRole(undefined)).toBe("student");
  });

  it("returns 'student' when metadata is missing", () => {
    expect(getUserRole({})).toBe("student");
  });

  it("returns 'student' when metadata has no role", () => {
    expect(getUserRole({ metadata: {} })).toBe("student");
  });

  it("returns 'admin' when role is admin", () => {
    expect(getUserRole({ metadata: { role: "admin" } })).toBe("admin");
  });

  it("returns 'student' when role is student", () => {
    expect(getUserRole({ metadata: { role: "student" } })).toBe("student");
  });

  it("maps the legacy 'member' role to student", () => {
    expect(getUserRole({ metadata: { role: "member" } })).toBe("student");
  });

  it("returns 'student' for unknown role values", () => {
    expect(getUserRole({ metadata: { role: "superadmin" } })).toBe("student");
  });

  it("returns 'student' when metadata is a non-object", () => {
    expect(getUserRole({ metadata: "string-value" })).toBe("student");
  });

  it("returns 'teacher' when role is teacher", () => {
    expect(getUserRole({ metadata: { role: "teacher" } })).toBe("teacher");
  });
});

describe("hasRole", () => {
  it("is an allow-list, not a hierarchy", () => {
    expect(hasRole("admin", ["teacher"])).toBe(false);
    expect(hasRole("teacher", ["teacher", "admin"])).toBe(true);
    expect(hasRole("admin", ["teacher", "admin"])).toBe(true);
    expect(hasRole("student", ["teacher", "admin"])).toBe(false);
  });
});
