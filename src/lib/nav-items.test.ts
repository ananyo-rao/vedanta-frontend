import { describe, it, expect } from "vitest";
import {
  sidebarNavItems,
  bottomTabItems,
  homepageNavLinks,
} from "./nav-items";

describe("nav-items", () => {
  describe("sidebarNavItems", () => {
    it("has BUILD items, then LEARN items, then TEACH", () => {
      expect(sidebarNavItems).toHaveLength(10);
      expect(sidebarNavItems.map((i) => i.label)).toEqual([
        "Course Builder",
        "Teachings",
        "Live Sessions",
        "Developer Portal",
        "Courses",
        "AI Chat",
        "Guide Chat",
        "Journal",
        "Live Sessions",
        "Students",
      ]);
    });

    it("Developer Portal is an external admin-only link", () => {
      const dev = sidebarNavItems.find((i) => i.label === "Developer Portal");
      expect(dev?.roles).toEqual(["admin"]);
      expect(dev?.external).toBe(true);
      expect(dev?.href).toMatch(/^https?:\/\//);
    });

    it("Course Builder requires admin role", () => {
      const builder = sidebarNavItems.find(
        (i) => i.label === "Course Builder"
      );
      expect(builder?.roles).toEqual(["admin"]);
      expect(builder?.category).toBe("BUILD");
    });

    it("LEARN items are visible to everyone", () => {
      const learnItems = sidebarNavItems.filter(
        (i) => i.category === "LEARN"
      );
      learnItems.forEach((item) => {
        expect(item.roles).toBeUndefined();
      });
    });

    it("Students is visible to teachers and admins only", () => {
      const students = sidebarNavItems.find((i) => i.label === "Students");
      expect(students?.roles).toEqual(["teacher", "admin"]);
      expect(students?.category).toBe("TEACH");
      expect(students?.href).toBe("/app/guide/students");
    });

    it("never gates an item to students — that would hide it from staff", () => {
      sidebarNavItems.forEach((item) => {
        expect(item.roles?.includes("student")).toBeFalsy();
      });
    });

    it("has AI Chat, Guide Chat, Journal, and Live Sessions in LEARN", () => {
      const learn = sidebarNavItems
        .filter((i) => i.category === "LEARN")
        .map((i) => i.label);
      expect(learn).toEqual([
        "Courses",
        "AI Chat",
        "Guide Chat",
        "Journal",
        "Live Sessions",
      ]);
    });

    it("Live Sessions appears twice: an admin console and a member view", () => {
      const items = sidebarNavItems.filter((i) => i.label === "Live Sessions");
      expect(items).toHaveLength(2);

      // The console runs classes, so it is admin-only.
      const admin = items.find((i) => i.category === "BUILD");
      expect(admin?.href).toBe("/app/admin/sessions");
      expect(admin?.roles).toEqual(["admin"]);

      // The member view is open to everyone; the list is empty unless they
      // have actually been invited to something.
      const member = items.find((i) => i.category === "LEARN");
      expect(member?.href).toBe("/app/sessions");
      expect(member?.roles).toBeUndefined();
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
      expect(builder?.roles).toEqual(["admin"]);
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
