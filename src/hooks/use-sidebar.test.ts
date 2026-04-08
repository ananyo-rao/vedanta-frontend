import { describe, it, expect, beforeEach } from "vitest";
import { useSidebar } from "./use-sidebar";

describe("useSidebar", () => {
  beforeEach(() => {
    // Reset store state between tests
    useSidebar.setState({ collapsed: false });
  });

  it("starts with collapsed = false", () => {
    expect(useSidebar.getState().collapsed).toBe(false);
  });

  it("toggles collapsed state", () => {
    useSidebar.getState().toggle();
    expect(useSidebar.getState().collapsed).toBe(true);

    useSidebar.getState().toggle();
    expect(useSidebar.getState().collapsed).toBe(false);
  });

  it("sets collapsed state directly", () => {
    useSidebar.getState().setCollapsed(true);
    expect(useSidebar.getState().collapsed).toBe(true);

    useSidebar.getState().setCollapsed(false);
    expect(useSidebar.getState().collapsed).toBe(false);
  });
});
