import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
}));

import { useSession } from "next-auth/react";
const mockUseSession = vi.mocked(useSession);

import SubmitPage from "../page";

describe("SubmitPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock fetch to avoid network calls
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ categories: [] }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows sign-in gate when not authenticated", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: vi.fn(),
    });

    render(<SubmitPage />);

    expect(screen.getByText(/sign in to submit a comparison/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
  });

  it("shows loading state while session is loading", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
      update: vi.fn(),
    });

    render(<SubmitPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sign in/i })).not.toBeInTheDocument();
  });

  it("shows submission form when authenticated", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "user-1", name: "Test User", email: "test@example.com" },
        expires: "2099-01-01",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    render(<SubmitPage />);

    expect(screen.getByRole("heading", { name: /submit a comparison/i })).toBeInTheDocument();
    // Two "Product Name" fields exist (generic + name brand)
    const productNameInputs = screen.getAllByLabelText(/product name/i);
    expect(productNameInputs).toHaveLength(2);
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  it("shows submit button when authenticated", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "user-1", name: "Test User", email: "test@example.com" },
        expires: "2099-01-01",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    render(<SubmitPage />);

    expect(screen.getByRole("button", { name: /submit for review/i })).toBeInTheDocument();
  });
});
