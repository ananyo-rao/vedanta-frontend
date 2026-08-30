import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("renders the coming-soon placeholder", () => {
    render(<DashboardPage />);
    expect(
      screen.getByRole("heading", { name: /live sessions/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});
