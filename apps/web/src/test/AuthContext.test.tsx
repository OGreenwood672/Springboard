import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";

vi.mock("../api/auth", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
  },
}));

vi.mock("../api/profiles", () => ({
  profilesApi: {
    getMyProfile: vi
      .fn()
      .mockResolvedValue({ id: "p1", full_name: "Alex Taylor" }),
  },
}));

vi.mock("../api/businesses", () => ({
  businessesApi: {
    getMyBusiness: vi.fn().mockResolvedValue({ id: "b1", name: "Apex Tech" }),
  },
}));

const TestConsumer: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">
        {isAuthenticated ? "authenticated" : "unauthenticated"}
      </span>
      <span data-testid="user-email">{user?.email || "none"}</span>
      <button
        onClick={() =>
          login({ email: "youth@example.com", password: "Password123!" })
        }
      >
        Sign In Button
      </button>
      <button onClick={logout}>Sign Out Button</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("starts unauthenticated when no token exists", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "unauthenticated",
    );
    expect(screen.getByTestId("user-email")).toHaveTextContent("none");
  });

  it("logs in and stores token in sessionStorage", async () => {
    const mockUser = {
      id: "u1",
      email: "youth@example.com",
      role: "youth" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(authApi.login).mockResolvedValue({
      access_token: "mock-jwt-token-123",
      token_type: "bearer",
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    const btn = screen.getByText("Sign In Button");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(sessionStorage.getItem("springboard_token")).toBe(
        "mock-jwt-token-123",
      );
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "authenticated",
      );
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "youth@example.com",
      );
    });
  });
});
