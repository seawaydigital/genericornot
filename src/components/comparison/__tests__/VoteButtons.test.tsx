import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { VoteButtons } from "../VoteButtons";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

import { useSession } from "next-auth/react";
const mockUseSession = vi.mocked(useSession);

describe("VoteButtons", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default: authenticated
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1", name: "Test User" }, expires: "2099-01-01" },
      status: "authenticated",
      update: vi.fn(),
    });
  });

  it("renders three vote buttons when authenticated", () => {
    render(<VoteButtons comparisonId="cmp-1" />);
    expect(screen.getByRole("button", { name: /same quality/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close enough/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /not worth it/i })).toBeInTheDocument();
  });

  it("highlights user's current vote when initialVote is set", () => {
    const { container } = render(
      <VoteButtons comparisonId="cmp-1" initialVote="SAME_QUALITY" />
    );
    const sameQualityBtn = screen.getByRole("button", { name: /same quality/i });
    expect(sameQualityBtn.className).toContain("emerald");
  });

  it("does not highlight other buttons when initialVote is set", () => {
    render(<VoteButtons comparisonId="cmp-1" initialVote="SAME_QUALITY" />);
    const closeEnoughBtn = screen.getByRole("button", { name: /close enough/i });
    expect(closeEnoughBtn.className).not.toContain("amber-500 border-amber");
  });

  it("shows 'Sign in to vote' message when not authenticated", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: vi.fn(),
    });
    render(<VoteButtons comparisonId="cmp-1" />);
    expect(screen.getByText(/sign in to vote/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /same quality/i })).not.toBeInTheDocument();
  });

  it("shows 'Sign in to vote' message while session is loading", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
      update: vi.fn(),
    });
    render(<VoteButtons comparisonId="cmp-1" />);
    // While loading, buttons should not be shown
    expect(screen.queryByRole("button", { name: /same quality/i })).not.toBeInTheDocument();
  });

  it("calls POST /api/votes on button click", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ vote: { value: "SAME_QUALITY" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<VoteButtons comparisonId="cmp-1" />);
    fireEvent.click(screen.getByRole("button", { name: /same quality/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/votes",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ comparisonId: "cmp-1", value: "SAME_QUALITY" }),
        })
      );
    });

    vi.unstubAllGlobals();
  });

  it("applies optimistic UI highlight before API resolves", async () => {
    let resolveFetch!: (value: unknown) => void;
    const pendingFetch = new Promise((resolve) => { resolveFetch = resolve; });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pendingFetch));

    render(<VoteButtons comparisonId="cmp-1" />);
    fireEvent.click(screen.getByRole("button", { name: /close enough/i }));

    // Optimistic update should be immediate
    const closeEnoughBtn = screen.getByRole("button", { name: /close enough/i });
    expect(closeEnoughBtn.className).toContain("amber");

    // Resolve the fetch
    resolveFetch({ ok: true, json: async () => ({}) });
    vi.unstubAllGlobals();
  });

  it("reverts optimistic UI on API error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Server error" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<VoteButtons comparisonId="cmp-1" />);
    fireEvent.click(screen.getByRole("button", { name: /not worth it/i }));

    await waitFor(() => {
      const notWorthItBtn = screen.getByRole("button", { name: /not worth it/i });
      expect(notWorthItBtn.className).not.toContain("border-red-500");
    });

    vi.unstubAllGlobals();
  });
});
