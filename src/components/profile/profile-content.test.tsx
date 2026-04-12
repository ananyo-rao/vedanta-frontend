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

const adminProps = { ...defaultProps, userRole: "admin" as const };

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

  describe("Account Settings (admin only)", () => {
    it("does not show Account Settings for member role", () => {
      render(<ProfileContent {...defaultProps} />);

      expect(screen.queryByText("Account Settings")).not.toBeInTheDocument();
    });

    it("shows Account Settings for admin role", () => {
      render(<ProfileContent {...adminProps} />);

      expect(screen.getByText("Account Settings")).toBeInTheDocument();
    });

    it("shows role panel when Account Settings is clicked", () => {
      render(<ProfileContent {...adminProps} />);

      fireEvent.click(screen.getByText("Account Settings"));

      expect(screen.getByText("Role & Permissions")).toBeInTheDocument();
      expect(screen.getByText("Current Role")).toBeInTheDocument();
    });

    it("hides role panel when Account Settings is clicked again", () => {
      render(<ProfileContent {...adminProps} />);

      const button = screen.getByText("Account Settings");
      fireEvent.click(button);
      expect(screen.getByText("Role & Permissions")).toBeInTheDocument();

      fireEvent.click(button);
      expect(screen.queryByText("Role & Permissions")).not.toBeInTheDocument();
    });

    it("displays admin role badge", () => {
      render(<ProfileContent {...adminProps} />);

      fireEvent.click(screen.getByText("Account Settings"));

      expect(screen.getByText("admin")).toBeInTheDocument();
    });
  });

  describe("User Management (admin only)", () => {
    it("does not show User Management for member role", () => {
      render(<ProfileContent {...defaultProps} />);

      expect(screen.queryByText("User Management")).not.toBeInTheDocument();
    });

    it("shows User Management for admin role", () => {
      render(<ProfileContent {...adminProps} />);

      expect(screen.getByText("User Management")).toBeInTheDocument();
    });

    it("navigates to /app/admin/users when clicked", () => {
      render(<ProfileContent {...adminProps} />);

      fireEvent.click(screen.getByText("User Management"));

      expect(mockPush).toHaveBeenCalledWith("/app/admin/users");
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
      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...originalLocation, href: "" },
      });

      render(<ProfileContent {...defaultProps} />);

      fireEvent.click(screen.getByText("Sign Out"));

      expect(mockSignOut).toHaveBeenCalledTimes(1);
      await vi.waitFor(() => {
        expect(window.location.href).toBe("/");
      });

      Object.defineProperty(window, "location", {
        writable: true,
        value: originalLocation,
      });
    });
  });
});
