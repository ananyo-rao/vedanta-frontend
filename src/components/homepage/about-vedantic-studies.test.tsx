import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AboutVedanticStudies } from "./about-vedantic-studies";

const mockUseAuthHref = vi.fn();

vi.mock("@/hooks/use-auth-href", () => ({
  useAuthHref: () => mockUseAuthHref(),
}));

describe("AboutVedanticStudies", () => {
  beforeEach(() => {
    mockUseAuthHref.mockReset();
  });

  describe("when signed in", () => {
    beforeEach(() => {
      mockUseAuthHref.mockReturnValue("/app/dashboard");
    });

    it("links 'View Course Details' to /app/dashboard", () => {
      render(<AboutVedanticStudies />);

      const link = screen.getByRole("link", { name: /view course details/i });
      expect(link).toHaveAttribute("href", "/app/dashboard");
    });

    it("links all 'Enroll Now' buttons to /app/dashboard", () => {
      render(<AboutVedanticStudies />);

      const enrollLinks = screen.getAllByRole("link", { name: /enroll now/i });
      expect(enrollLinks).toHaveLength(2);
      enrollLinks.forEach((link) => {
        expect(link).toHaveAttribute("href", "/app/dashboard");
      });
    });

    it("links 'Browse All Courses' to /app/dashboard", () => {
      render(<AboutVedanticStudies />);

      const link = screen.getByRole("link", { name: /browse all courses/i });
      expect(link).toHaveAttribute("href", "/app/dashboard");
    });
  });

  describe("when signed out", () => {
    beforeEach(() => {
      mockUseAuthHref.mockReturnValue("/sign-in");
    });

    it("links 'View Course Details' to /sign-in", () => {
      render(<AboutVedanticStudies />);

      const link = screen.getByRole("link", { name: /view course details/i });
      expect(link).toHaveAttribute("href", "/sign-in");
    });

    it("links all 'Enroll Now' buttons to /sign-in", () => {
      render(<AboutVedanticStudies />);

      const enrollLinks = screen.getAllByRole("link", { name: /enroll now/i });
      expect(enrollLinks).toHaveLength(2);
      enrollLinks.forEach((link) => {
        expect(link).toHaveAttribute("href", "/sign-in");
      });
    });

    it("links 'Browse All Courses' to /sign-in", () => {
      render(<AboutVedanticStudies />);

      const link = screen.getByRole("link", { name: /browse all courses/i });
      expect(link).toHaveAttribute("href", "/sign-in");
    });
  });

  it("renders course cards for Introduction to Advaita and Karma Yoga", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<AboutVedanticStudies />);

    expect(screen.getByText("Introduction to Advaita")).toBeInTheDocument();
    expect(screen.getByText("Karma Yoga")).toBeInTheDocument();
  });

  it("renders the featured Bhagavad Gita course", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<AboutVedanticStudies />);

    expect(screen.getByText("The Bhagavad Gita: Yoga of Action")).toBeInTheDocument();
  });

  it("has correct section id for anchor navigation", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    const { container } = render(<AboutVedanticStudies />);

    expect(container.querySelector("#about-courses")).toBeInTheDocument();
  });
});
