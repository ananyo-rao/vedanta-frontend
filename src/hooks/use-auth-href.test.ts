import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuthHref } from "./use-auth-href";

const mockUseAuth = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("useAuthHref", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("returns /app/dashboard when signed in", () => {
    mockUseAuth.mockReturnValue({ isSignedIn: true });

    const { result } = renderHook(() => useAuthHref());
    expect(result.current).toBe("/app/dashboard");
  });

  it("returns /sign-in when not signed in", () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });

    const { result } = renderHook(() => useAuthHref());
    expect(result.current).toBe("/sign-in");
  });

  it("returns /sign-in when isSignedIn is undefined", () => {
    mockUseAuth.mockReturnValue({ isSignedIn: undefined });

    const { result } = renderHook(() => useAuthHref());
    expect(result.current).toBe("/sign-in");
  });

  it("accepts a custom authenticated path", () => {
    mockUseAuth.mockReturnValue({ isSignedIn: true });

    const { result } = renderHook(() => useAuthHref("/app/courses"));
    expect(result.current).toBe("/app/courses");
  });

  it("returns /sign-in with custom path when not signed in", () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });

    const { result } = renderHook(() => useAuthHref("/app/courses"));
    expect(result.current).toBe("/sign-in");
  });
});
