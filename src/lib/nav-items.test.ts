import { describe, it, expect } from "vitest";
import {
  sidebarNavItems,
  bottomTabItems,
  homepageNavLinks,
} from "./nav-items";

describe("nav-items", () => {
  describe("sidebarNavItems", () => {
    it("has Courses and Mentorship items", () => {
      expect(sidebarNavItems).toHaveLength(2);
      expect(sidebarNavItems[0].label).toBe("Courses");
      expect(sidebarNavItems[1].label).toBe("Mentorship");
    });

    it("all items have LEARN category", () => {
      sidebarNavItems.forEach((item) => {
        expect(item.category).toBe("LEARN");
      });
    });

    it("Mentorship has Soon badge", () => {
      const mentorship = sidebarNavItems.find(
        (i) => i.label === "Mentorship"
      );
      expect(mentorship?.badge).toBe("Soon");
    });

    it("Courses has no badge", () => {
      const courses = sidebarNavItems.find((i) => i.label === "Courses");
      expect(courses?.badge).toBeUndefined();
    });

    it("all items have /app/ prefix in href", () => {
      sidebarNavItems.forEach((item) => {
        expect(item.href).toMatch(/^\/app\//);
      });
    });
  });

  describe("bottomTabItems", () => {
    it("has 3 tabs: Courses, Mentorship, Profile", () => {
      expect(bottomTabItems).toHaveLength(3);
      expect(bottomTabItems.map((t) => t.label)).toEqual([
        "Courses",
        "Mentorship",
        "Profile",
      ]);
    });

    it("all items have /app/ prefix in href", () => {
      bottomTabItems.forEach((item) => {
        expect(item.href).toMatch(/^\/app\//);
      });
    });
  });

  describe("homepageNavLinks", () => {
    it("has 3 navbar links: Home, Courses, About Us", () => {
      expect(homepageNavLinks).toHaveLength(3);
      expect(homepageNavLinks.map((l) => l.label)).toEqual([
        "Home",
        "Courses",
        "About Us",
      ]);
    });

    it("all links have anchor hrefs", () => {
      homepageNavLinks.forEach((link) => {
        expect(link.href).toMatch(/^#/);
      });
    });
  });
});
