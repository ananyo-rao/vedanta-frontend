import { describe, it, expect, beforeEach } from "vitest";
import { useSidebarStore } from "./use-sidebar";

describe("useSidebarStore", () => {
  beforeEach(() => {
    useSidebarStore.setState({ collapsed: false });
  });

  it("starts with collapsed = false", () => {
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it("toggles collapsed state", () => {
    useSidebarStore.getState().toggle();
    expect(useSidebarStore.getState().collapsed).toBe(true);

    useSidebarStore.getState().toggle();
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it("sets collapsed state directly", () => {
    useSidebarStore.getState().setCollapsed(true);
    expect(useSidebarStore.getState().collapsed).toBe(true);

    useSidebarStore.getState().setCollapsed(false);
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });
});
