import { describe, it, expect } from "vitest";
import { useCoursePlayerStore } from "./use-course-player";
import { act } from "@testing-library/react";

describe("useCoursePlayerStore", () => {
  it("starts with sidebar closed", () => {
    const state = useCoursePlayerStore.getState();
    expect(state.sidebarOpen).toBe(false);
  });

  it("toggleSidebar opens the sidebar", () => {
    act(() => {
      useCoursePlayerStore.getState().toggleSidebar();
    });
    expect(useCoursePlayerStore.getState().sidebarOpen).toBe(true);
  });

  it("toggleSidebar closes the sidebar when open", () => {
    // Ensure open first
    act(() => {
      useCoursePlayerStore.getState().setSidebarOpen(true);
    });
    expect(useCoursePlayerStore.getState().sidebarOpen).toBe(true);

    act(() => {
      useCoursePlayerStore.getState().toggleSidebar();
    });
    expect(useCoursePlayerStore.getState().sidebarOpen).toBe(false);
  });

  it("setSidebarOpen sets specific state", () => {
    act(() => {
      useCoursePlayerStore.getState().setSidebarOpen(true);
    });
    expect(useCoursePlayerStore.getState().sidebarOpen).toBe(true);

    act(() => {
      useCoursePlayerStore.getState().setSidebarOpen(false);
    });
    expect(useCoursePlayerStore.getState().sidebarOpen).toBe(false);
  });
});
