import { describe, it, expect } from "vitest";
import {
  sidebarNavItems,
  bottomTabItems,
  homepageNavLinks,
} from "./nav-items";

describe("nav-items", () => {
  describe("sidebarNavItems", () => {
    it("has BUILD items (Course Builder, Developer Portal) then LEARN items", () => {
      expect(sidebarNavItems).toHaveLength(6);
      expect(sidebarNavItems.map((i) => i.label)).toEqual([
        "Course Builder",
        "Developer Portal",
        "Courses",
        "AI Chat",
        "Guide Chat",
        "Journal",
      ]);
    });

    it("Developer Portal is an external admin-only link", () => {
      const dev = sidebarNavItems.find((i) => i.label === "Developer Portal");
      expect(dev?.requiredRole).toBe("admin");
      expect(dev?.external).toBe(true);
      expect(dev?.href).toMatch(/^https?:\/\//);
    });

    it("Course Builder requires admin role", () => {
      const builder = sidebarNavItems.find(
        (i) => i.label === "Course Builder"
      );
      expect(builder?.requiredRole).toBe("admin");
      expect(builder?.category).toBe("BUILD");
    });

    it("LEARN items have no requiredRole", () => {
      const learnItems = sidebarNavItems.filter(
        (i) => i.category === "LEARN"
      );
      learnItems.forEach((item) => {
        expect(item.requiredRole).toBeUndefined();
      });
    });

    it("has AI Chat, Guide Chat, and Journal in LEARN", () => {
      const learn = sidebarNavItems
        .filter((i) => i.category === "LEARN")
        .map((i) => i.label);
      expect(learn).toEqual(["Courses", "AI Chat", "Guide Chat", "Journal"]);
    });

    it("internal items have /app/ prefix in href", () => {
      sidebarNavItems
        .filter((item) => !item.external)
        .forEach((item) => {
          expect(item.href).toMatch(/^\/app\//);
        });
    });
  });

  describe("bottomTabItems", () => {
    it("has 4 tabs: Courses, AI Chat, Builder, Profile", () => {
      expect(bottomTabItems).toHaveLength(4);
      expect(bottomTabItems.map((t) => t.label)).toEqual([
        "Courses",
        "AI Chat",
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
