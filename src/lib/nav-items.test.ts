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
    it("has 6 anchor links in correct order", () => {
      expect(homepageNavLinks).toHaveLength(6);
      expect(homepageNavLinks.map((l) => l.href)).toEqual([
        "#home",
        "#about-vedanta",
        "#about-courses",
        "#parampara",
        "#swami-dayananda",
        "#swami-satchitananda",
      ]);
    });

    it("all links have both label and shortLabel", () => {
      homepageNavLinks.forEach((link) => {
        expect(link.label).toBeTruthy();
        expect(link.shortLabel).toBeTruthy();
      });
    });

    it("shortLabels are shorter or equal to labels", () => {
      homepageNavLinks.forEach((link) => {
        expect(link.shortLabel.length).toBeLessThanOrEqual(
          link.label.length
        );
      });
    });
  });
});
