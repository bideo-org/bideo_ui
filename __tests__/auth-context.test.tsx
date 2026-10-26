import React from "react";
import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/store/auth-context";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  RedirectType: { replace: "replace" },
}));

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock requests
jest.mock("@/utility/requests", () => ({
  getUser: jest.fn().mockResolvedValue({
    userId: "u123",
    user_name: "John Doe",
    user_email: "john@example.com",
    avatar_url: "/avatar.png",
  }),
}));

const TestConsumer = () => {
  const { token, isAuthenticated, user, login, logout, setUserInfo, isLoaded } =
    useAuth();

  return (
    <div>
      <span data-testid="is-loaded">{isLoaded ? "loaded" : "loading"}</span>
      <span data-testid="auth-status">
        {isAuthenticated ? "authenticated" : "guest"}
      </span>
      <span data-testid="token">{token || "no-token"}</span>
      <span data-testid="username">{user?.user_name || "anonymous"}</span>
      <button
        data-testid="login-btn"
        onClick={async () => {
          await login("fake-jwt-token", "u123");
        }}
      >
        Login
      </button>
      <button
        data-testid="logout-btn"
        onClick={async () => {
          await logout();
        }}
      >
        Logout
      </button>
      <button
        data-testid="set-user-btn"
        onClick={() =>
          setUserInfo({
            userId: "u123",
            user_name: "Jane Smith",
            user_email: "jane@example.com",
            avatar_url: "/jane.png",
          })
        }
      >
        Set User
      </button>
    </div>
  );
};

describe("AuthContext & AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === "/ui/auth/session") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: null, uid: null }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  it("throws error when useAuth is used outside AuthProvider", () => {
    // Suppress React boundary console.error for expected throw
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used within AuthProvider"
    );

    spy.mockRestore();
  });

  it("initializes in unauthenticated guest state", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loaded")).toHaveTextContent("loaded");
    });

    expect(screen.getByTestId("auth-status")).toHaveTextContent("guest");
    expect(screen.getByTestId("token")).toHaveTextContent("no-token");
    expect(screen.getByTestId("username")).toHaveTextContent("anonymous");
  });

  it("authenticates when login is called and calls setSession API", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loaded")).toHaveTextContent("loaded");
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("login-btn"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/ui/auth/setSession",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "fake-jwt-token", uid: "u123" }),
      })
    );
    expect(screen.getByTestId("token")).toHaveTextContent("fake-jwt-token");
  });

  it("updates user state when setUserInfo is called", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loaded")).toHaveTextContent("loaded");
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("set-user-btn"));
    });

    expect(screen.getByTestId("username")).toHaveTextContent("Jane Smith");
  });

  it("clears token and user on logout", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loaded")).toHaveTextContent("loaded");
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("login-btn"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("logout-btn"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("guest");
    });

    expect(global.fetch).toHaveBeenCalledWith("/ui/auth/logout", {
      method: "POST",
    });
    expect(screen.getByTestId("token")).toHaveTextContent("no-token");
  });
});
