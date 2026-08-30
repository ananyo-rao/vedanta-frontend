import { describe, it, expect } from "vitest";
import {
  sidebarNavItems,
  bottomTabItems,
  homepageNavLinks,
} from "./nav-items";

describe("nav-items", () => {
  describe("sidebarNavItems", () => {
    it("has BUILD items then SHRAVANAM, MANANAM, NIDHIYAASANAM items", () => {
      expect(sidebarNavItems).toHaveLength(5);
      expect(sidebarNavItems.map((i) => i.label)).toEqual([
        "Course Builder",
        "Developer Portal",
        "Live Sessions",
        "My Journey",
        "Tapas",
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

    it("non-admin items have no requiredRole", () => {
      const nonAdmin = sidebarNavItems.filter(
        (i) => i.category !== "BUILD"
      );
      nonAdmin.forEach((item) => {
        expect(item.requiredRole).toBeUndefined();
      });
    });

    it("has My Journey in MANANAM", () => {
      const mananam = sidebarNavItems
        .filter((i) => i.category === "MANANAM")
        .map((i) => i.label);
      expect(mananam).toEqual(["My Journey"]);
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
    it("has 5 tabs: Journey, Sessions, Tapas, Builder, Profile", () => {
      expect(bottomTabItems).toHaveLength(5);
      expect(bottomTabItems.map((t) => t.label)).toEqual([
        "Journey",
        "Sessions",
        "Tapas",
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
