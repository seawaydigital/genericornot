import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EvidenceForm } from "../EvidenceForm";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

import { useSession } from "next-auth/react";
const mockUseSession = vi.mocked(useSession);

describe("EvidenceForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default: authenticated
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1", name: "Test User" }, expires: "2099-01-01" },
      status: "authenticated",
      update: vi.fn(),
    });
  });

  it("renders all form fields when authenticated", () => {
    render(<EvidenceForm comparisonId="cmp-1" />);
    expect(screen.getByRole("combobox")).toBeInTheDocument(); // type dropdown
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
  });

  it("renders type dropdown with all evidence type options", () => {
    render(<EvidenceForm comparisonId="cmp-1" />);
    expect(screen.getByText("Manufacturer Info")).toBeInTheDocument();
    expect(screen.getByText("Ingredient Comparison")).toBeInTheDocument();
    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("Video Link")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("shows sign-in message when not authenticated", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: vi.fn(),
    });
    render(<EvidenceForm comparisonId="cmp-1" />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
  });

  it("shows sign-in message while session is loading", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
      update: vi.fn(),
    });
    render(<EvidenceForm comparisonId="cmp-1" />);
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
  });

  it("submits form data to /api/evidence on submit", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ evidence: { id: "ev-1" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<EvidenceForm comparisonId="cmp-1" />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "MANUFACTURER_INFO" } });
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Test Title" } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: "Test content here" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/evidence",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            comparisonId: "cmp-1",
            type: "MANUFACTURER_INFO",
            title: "Test Title",
            content: "Test content here",
            url: "",
          }),
        })
      );
    });

    vi.unstubAllGlobals();
  });

  it("shows success message after successful submission", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ evidence: { id: "ev-1" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<EvidenceForm comparisonId="cmp-1" />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Test Title" } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: "Test content" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/evidence submitted/i)).toBeInTheDocument();
    });

    vi.unstubAllGlobals();
  });

  it("clears form fields after successful submission", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ evidence: { id: "ev-1" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<EvidenceForm comparisonId="cmp-1" />);

    const titleInput = screen.getByLabelText(/title/i);
    const contentTextarea = screen.getByLabelText(/content/i);

    fireEvent.change(titleInput, { target: { value: "My title" } });
    fireEvent.change(contentTextarea, { target: { value: "My content" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect((titleInput as HTMLInputElement).value).toBe("");
      expect((contentTextarea as HTMLTextAreaElement).value).toBe("");
    });

    vi.unstubAllGlobals();
  });

  it("calls onEvidenceAdded callback after successful submission", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ evidence: { id: "ev-1" } }),
    });
    vi.stubGlobal("fetch", mockFetch);
    const onEvidenceAdded = vi.fn();

    render(<EvidenceForm comparisonId="cmp-1" onEvidenceAdded={onEvidenceAdded} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Title" } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: "Content" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(onEvidenceAdded).toHaveBeenCalledOnce();
    });

    vi.unstubAllGlobals();
  });

  it("shows error message on API failure", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Server error" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<EvidenceForm comparisonId="cmp-1" />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Title" } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: "Content" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    vi.unstubAllGlobals();
  });

  it("shows 'Add Evidence' section heading", () => {
    render(<EvidenceForm comparisonId="cmp-1" />);
    expect(screen.getByText("Add Evidence")).toBeInTheDocument();
  });
});
