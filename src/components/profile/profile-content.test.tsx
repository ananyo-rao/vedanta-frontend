import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileContent } from "./profile-content";

const mockSignOut = vi.fn().mockResolvedValue(undefined);
const mockOpenUserProfile = vi.fn();
const mockPush = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({
    signOut: mockSignOut,
    openUserProfile: mockOpenUserProfile,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const defaultProps = {
  userName: "Arjuna Pandava",
  userEmail: "arjuna@vedanta.academy",
  userImageUrl: "/images/arjuna.jpg",
  userRole: "member" as const,
};

describe("ProfileContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user name and email", () => {
    render(<ProfileContent {...defaultProps} />);

    expect(screen.getByText("Arjuna Pandava")).toBeInTheDocument();
    expect(screen.getByText("arjuna@vedanta.academy")).toBeInTheDocument();
  });

  it("renders initials in avatar fallback", () => {
    render(<ProfileContent {...defaultProps} />);

    expect(screen.getByText("AP")).toBeInTheDocument();
  });

  it("renders 'U' when userName is empty", () => {
    render(<ProfileContent {...defaultProps} userName="" />);

    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("renders 'Student' when userName is empty", () => {
    render(<ProfileContent {...defaultProps} userName="" />);

    expect(screen.getByText("Student")).toBeInTheDocument();
  });

  describe("Account Settings toggle", () => {
    it("does not show role panel by default", () => {
      render(<ProfileContent {...defaultProps} />);

      expect(screen.queryByText("Role & Permissions")).not.toBeInTheDocument();
    });

    it("shows role panel when Account Settings is clicked", () => {
      render(<ProfileContent {...defaultProps} />);

      fireEvent.click(screen.getByText("Account Settings"));

      expect(screen.getByText("Role & Permissions")).toBeInTheDocument();
      expect(screen.getByText("Current Role")).toBeInTheDocument();
    });

    it("hides role panel when Account Settings is clicked again", () => {
      render(<ProfileContent {...defaultProps} />);

      const button = screen.getByText("Account Settings");
      fireEvent.click(button);
      expect(screen.getByText("Role & Permissions")).toBeInTheDocument();

      fireEvent.click(button);
      expect(screen.queryByText("Role & Permissions")).not.toBeInTheDocument();
    });

    it("displays 'member' role badge", () => {
      render(<ProfileContent {...defaultProps} userRole="member" />);

      fireEvent.click(screen.getByText("Account Settings"));

      expect(screen.getByText("member")).toBeInTheDocument();
    });

    it("displays 'admin' role badge", () => {
      render(<ProfileContent {...defaultProps} userRole="admin" />);

      fireEvent.click(screen.getByText("Account Settings"));

      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    it("shows coming soon message for role management", () => {
      render(<ProfileContent {...defaultProps} />);

      fireEvent.click(screen.getByText("Account Settings"));

      expect(
        screen.getByText(/role and permission management is coming soon/i)
      ).toBeInTheDocument();
    });
  });

  describe("Edit Profile button", () => {
    it("calls openUserProfile when clicked", () => {
      render(<ProfileContent {...defaultProps} />);

      fireEvent.click(screen.getByText("Edit Profile"));

      expect(mockOpenUserProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe("Sign Out button", () => {
    it("calls signOut and redirects to home", async () => {
      render(<ProfileContent {...defaultProps} />);

      fireEvent.click(screen.getByText("Sign Out"));

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      await vi.waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
  });
});
