import { describe, it, expect } from "vitest";
import {
  sidebarNavItems,
  bottomTabItems,
  homepageNavLinks,
} from "./nav-items";

describe("nav-items", () => {
  describe("sidebarNavItems", () => {
    it("has Courses, Mentorship, and Course Builder items", () => {
      expect(sidebarNavItems).toHaveLength(3);
      expect(sidebarNavItems.map((i) => i.label)).toEqual([
        "Courses",
        "Mentorship",
        "Course Builder",
      ]);
    });

    it("Course Builder requires admin role", () => {
      const builder = sidebarNavItems.find(
        (i) => i.label === "Course Builder"
      );
      expect(builder?.requiredRole).toBe("admin");
      expect(builder?.category).toBe("ADMIN");
    });

    it("LEARN items have no requiredRole", () => {
      const learnItems = sidebarNavItems.filter(
        (i) => i.category === "LEARN"
      );
      learnItems.forEach((item) => {
        expect(item.requiredRole).toBeUndefined();
      });
    });

    it("Mentorship has Soon badge, Course Builder does not", () => {
      const mentorship = sidebarNavItems.find(
        (i) => i.label === "Mentorship"
      );
      const builder = sidebarNavItems.find(
        (i) => i.label === "Course Builder"
      );
      expect(mentorship?.badge).toBe("Soon");
      expect(builder?.badge).toBeUndefined();
    });

    it("all items have /app/ prefix in href", () => {
      sidebarNavItems.forEach((item) => {
        expect(item.href).toMatch(/^\/app\//);
      });
    });
  });

  describe("bottomTabItems", () => {
    it("has 4 tabs: Courses, Mentorship, Builder, Profile", () => {
      expect(bottomTabItems).toHaveLength(4);
      expect(bottomTabItems.map((t) => t.label)).toEqual([
        "Courses",
        "Mentorship",
        "Builder",
        "Profile",
      ]);
    });

    it("Builder tab requires admin role", () => {
      const builder = bottomTabItems.find((t) => t.label === "Builder");
      expect(builder?.requiredRole).toBe("admin");
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
