import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { GoogleSignInButton } from "@/components/user/GoogleSignInButton";
import { api_instance } from "@/global";

describe("GoogleSignInButton", () => {
  it("renders with 'Sign in with Google' in login mode", () => {
    render(<GoogleSignInButton mode="login" />);
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("renders with 'Sign up with Google' in signup mode", () => {
    render(<GoogleSignInButton mode="signup" />);
    expect(screen.getByText("Sign up with Google")).toBeInTheDocument();
  });

  it("triggers redirect to backend Google OAuth route on click", () => {
    render(<GoogleSignInButton mode="login" />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);

    expect(screen.getByText("Redirecting to Google...")).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  it("appends callbackUrl to redirect url when provided", () => {
    render(<GoogleSignInButton mode="login" callbackUrl="/watch/my-clip" />);
    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByText("Redirecting to Google...")).toBeInTheDocument();
  });
});
