import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { makeSession } from "@/test/fixtures";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { useSession } from "next-auth/react";
const mockUseSession = vi.mocked(useSession);

import SubmitPage from "../page";

function signedIn() {
  mockUseSession.mockReturnValue({ data: makeSession(), status: "authenticated", update: vi.fn() });
}

describe("SubmitPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ categories: [{ id: "cat-1", name: "Grocery", icon: "🛒", slug: "grocery" }] }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a sign-in gate that returns the user to /submit", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() });
    render(<SubmitPage />);

    expect(screen.getByText(/sign in to submit a comparison/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to continue/i })).toHaveAttribute(
      "href",
      "/auth/signin?callbackUrl=%2Fsubmit"
    );
  });

  it("shows loading state while session is loading", () => {
    mockUseSession.mockReturnValue({ data: null, status: "loading", update: vi.fn() });
    render(<SubmitPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /sign in/i })).not.toBeInTheDocument();
  });

  it("shows the submission form with Canadian examples when authenticated", () => {
    signedIn();
    render(<SubmitPage />);

    expect(screen.getByRole("heading", { name: /submit a comparison/i })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/product name/i)).toHaveLength(2);
    expect(screen.getAllByLabelText(/package size/i)).toHaveLength(2);
    expect(screen.getAllByLabelText(/price in cad/i)).toHaveLength(2);
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/No Name, President's Choice/)).toBeInTheDocument();
  });

  it("shows submit button when authenticated", () => {
    signedIn();
    render(<SubmitPage />);
    expect(screen.getByRole("button", { name: /submit for review/i })).toBeInTheDocument();
  });

  it("links to the existing comparison when the server reports a duplicate", async () => {
    signedIn();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ categories: [{ id: "cat-1", name: "Grocery", icon: "🛒", slug: "grocery" }] }) })
      .mockResolvedValueOnce({ ok: false, status: 409, json: async () => ({ duplicate: true, existingSlug: "life-brand-ibuprofen-vs-advil" }) });
    vi.stubGlobal("fetch", fetchMock);

    render(<SubmitPage />);
    await waitFor(() => expect(screen.getByRole("option", { name: /grocery/i })).toBeInTheDocument());

    const [genericName, brandName] = screen.getAllByLabelText(/product name/i);
    fireEvent.change(genericName, { target: { value: "Life Brand Ibuprofen" } });
    fireEvent.change(screen.getByLabelText(/^brand/i, { selector: "#genericBrand" }), { target: { value: "Life Brand" } });
    fireEvent.change(screen.getByLabelText(/store/i), { target: { value: "Shoppers Drug Mart" } });
    fireEvent.change(brandName, { target: { value: "Advil" } });
    fireEvent.change(screen.getByLabelText(/^brand/i, { selector: "#nameBrand" }), { target: { value: "Advil" } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "cat-1" } });
    fireEvent.click(screen.getByRole("button", { name: /submit for review/i }));

    await waitFor(() =>
      expect(screen.getByRole("link", { name: /view it and vote/i })).toHaveAttribute(
        "href",
        "/compare/life-brand-ibuprofen-vs-advil"
      )
    );
  });
});
