import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

import { useSession } from "next-auth/react";
import { VotePanel } from "../VotePanel";

const mockUseSession = vi.mocked(useSession);

const props = {
  comparisonId: "comp-1",
  slug: "life-brand-ibuprofen-vs-advil",
  genericBrand: "Life Brand",
  nameBrand: "Advil",
  initialCounts: { sameQuality: 2, closeEnough: 1, notWorthIt: 0 },
};

function authenticated() {
  mockUseSession.mockReturnValue({
    data: { user: { id: "user-1", role: "USER", username: "thrifty-loon-1234" }, expires: "2099-01-01" },
    status: "authenticated",
    update: vi.fn(),
  });
}

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

describe("VotePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("asks the question and shows the current tally", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() });
    render(<VotePanel {...props} />);
    expect(screen.getByRole("heading", { name: /is life brand worth it\?/i })).toBeInTheDocument();
    expect(screen.getByText(/3 community votes · 2 more needed/i)).toBeInTheDocument();
  });

  it("sends signed-out visitors to sign in and remembers their vote", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() });
    render(<VotePanel {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /same quality/i }));

    expect(window.sessionStorage.getItem("genericornot:pendingVote:comp-1")).toBe("SAME_QUALITY");
    expect(push).toHaveBeenCalledWith("/auth/signin?callbackUrl=%2Fcompare%2Flife-brand-ibuprofen-vs-advil");
  });

  it("loads the signed-in user's existing vote", async () => {
    authenticated();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ vote: { value: "CLOSE_ENOUGH" } }));
    vi.stubGlobal("fetch", fetchMock);

    render(<VotePanel {...props} />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /close enough/i })).toHaveAttribute("aria-pressed", "true")
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/votes?comparisonId=comp-1");
  });

  it("submits a vote and updates the tally from the server's counts", async () => {
    authenticated();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ vote: null }))
      .mockResolvedValueOnce(jsonResponse({ counts: { sameQuality: 3, closeEnough: 1, notWorthIt: 0 } }));
    vi.stubGlobal("fetch", fetchMock);

    render(<VotePanel {...props} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: /same quality/i }));

    await waitFor(() => expect(screen.getByText(/4 community votes · 1 more needed/i)).toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent(/thanks/i);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/votes",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ comparisonId: "comp-1", value: "SAME_QUALITY" }) })
    );
  });

  it("shows the server's error message and reverts the selection", async () => {
    authenticated();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ vote: null }))
      .mockResolvedValueOnce(jsonResponse({ error: "New accounts can vote after 60 minutes." }, false, 403));
    vi.stubGlobal("fetch", fetchMock);

    render(<VotePanel {...props} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: /not worth it/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("New accounts can vote after 60 minutes."));
    expect(screen.getByRole("button", { name: /not worth it/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("replays a vote made before signing in", async () => {
    authenticated();
    window.sessionStorage.setItem("genericornot:pendingVote:comp-1", "SAME_QUALITY");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ vote: null }))
      .mockResolvedValueOnce(jsonResponse({ counts: { sameQuality: 3, closeEnough: 1, notWorthIt: 0 } }));
    vi.stubGlobal("fetch", fetchMock);

    render(<VotePanel {...props} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "POST" });
    expect(window.sessionStorage.getItem("genericornot:pendingVote:comp-1")).toBeNull();
  });
});
