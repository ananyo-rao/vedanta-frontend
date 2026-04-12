import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HeroSection } from "./hero-section";

const mockUseAuthHref = vi.fn();

vi.mock("@/hooks/use-auth-href", () => ({
  useAuthHref: () => mockUseAuthHref(),
}));

describe("HeroSection", () => {
  beforeEach(() => {
    mockUseAuthHref.mockReset();
  });

  it("links 'Begin Your Study' to /app/dashboard when signed in", () => {
    mockUseAuthHref.mockReturnValue("/app/dashboard");
    render(<HeroSection />);

    const link = screen.getByRole("link", { name: /begin your study/i });
    expect(link).toHaveAttribute("href", "/app/dashboard");
  });

  it("links 'Begin Your Study' to /sign-in when signed out", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<HeroSection />);

    const link = screen.getByRole("link", { name: /begin your study/i });
    expect(link).toHaveAttribute("href", "/sign-in");
  });

  it("renders the hero heading", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    render(<HeroSection />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /vedanta is the/i
    );
  });

  it("has correct section id for anchor navigation", () => {
    mockUseAuthHref.mockReturnValue("/sign-in");
    const { container } = render(<HeroSection />);

    expect(container.querySelector("#home")).toBeInTheDocument();
  });
});
