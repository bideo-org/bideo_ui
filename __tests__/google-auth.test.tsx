import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GoogleSignInButton } from "@/components/user/GoogleSignInButton";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";
import { googleLogin } from "@/utility/requests";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-context";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock auth-context
jest.mock("@/store/auth-context", () => ({
  useAuth: jest.fn(),
}));

// Mock @/lib/firebase
jest.mock("@/lib/firebase", () => ({
  auth: {},
  googleProvider: {},
  signInWithPopup: jest.fn(),
}));

// Mock @/utility/requests
jest.mock("@/utility/requests", () => ({
  googleLogin: jest.fn(),
}));

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("GoogleSignInButton", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      user: null,
    });
  });

  it("renders with 'Sign in with Google' in login mode", () => {
    render(<GoogleSignInButton mode="login" />);
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("renders with 'Sign up with Google' in signup mode", () => {
    render(<GoogleSignInButton mode="signup" />);
    expect(screen.getByText("Sign up with Google")).toBeInTheDocument();
  });

  it("completes full Google sign-in flow and redirects", async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue("test-google-id-token"),
      displayName: "Jane Doe",
    };
    (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser });
    (googleLogin as jest.Mock).mockResolvedValue({
      idToken: "backend-session-token",
      uid: "user-123",
      user: { userId: "user-123" },
    });

    render(<GoogleSignInButton mode="login" callbackUrl="/dashboard" />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(googleLogin).toHaveBeenCalledWith({
        idToken: "test-google-id-token",
        fullName: "Jane Doe",
      });
      expect(mockLogin).toHaveBeenCalledWith("backend-session-token", "user-123");
      expect(toast.success).toHaveBeenCalledWith(
        "Signed in with Google successfully!"
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("handles user closing popup gracefully without error toast", async () => {
    const error = new Error("Popup closed") as any;
    error.code = "auth/popup-closed-by-user";
    (signInWithPopup as jest.Mock).mockRejectedValue(error);

    render(<GoogleSignInButton mode="login" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });

    // Should NOT call toast.error
    expect(toast.error).not.toHaveBeenCalled();
    // Button should be re-enabled
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("shows error toast when backend rejects login", async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue("test-google-id-token"),
    };
    (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser });
    (googleLogin as jest.Mock).mockRejectedValue(new Error("Server error"));

    render(<GoogleSignInButton mode="login" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });
});
