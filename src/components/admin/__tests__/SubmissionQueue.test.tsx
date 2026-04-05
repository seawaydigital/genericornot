import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SubmissionQueue } from "../SubmissionQueue";

const MOCK_COMPARISONS = [
  {
    id: "cmp-1",
    genericProductName: "Ibuprofen 200mg",
    genericBrand: "CVS Health",
    genericStore: "CVS",
    nameBrandProductName: "Advil 200mg",
    nameBrand: "Advil",
    createdAt: "2026-03-01T00:00:00.000Z",
    category: { name: "Medicine", icon: "💊" },
    submittedBy: { name: "Alice Smith", username: "alice-123" },
  },
  {
    id: "cmp-2",
    genericProductName: "Acetaminophen 500mg",
    genericBrand: "Target Up&Up",
    genericStore: "Target",
    nameBrandProductName: "Tylenol 500mg",
    nameBrand: "Tylenol",
    createdAt: "2026-03-02T00:00:00.000Z",
    category: { name: "Medicine", icon: "💊" },
    submittedBy: { name: "Bob Jones", username: "bob-456" },
  },
];

describe("SubmissionQueue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders all pending submissions", () => {
    render(<SubmissionQueue initialComparisons={MOCK_COMPARISONS} />);

    expect(screen.getByText(/Ibuprofen 200mg vs Advil 200mg/i)).toBeInTheDocument();
    expect(screen.getByText(/Acetaminophen 500mg vs Tylenol 500mg/i)).toBeInTheDocument();
  });

  it("shows submitter info for each comparison", () => {
    render(<SubmissionQueue initialComparisons={MOCK_COMPARISONS} />);

    expect(screen.getByText(/alice smith/i)).toBeInTheDocument();
    expect(screen.getByText(/@alice-123/i)).toBeInTheDocument();
  });

  it("shows category info", () => {
    render(<SubmissionQueue initialComparisons={MOCK_COMPARISONS} />);

    // Both items have Medicine category
    const medicineLabels = screen.getAllByText(/medicine/i);
    expect(medicineLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("shows Approve and Reject buttons for each item", () => {
    render(<SubmissionQueue initialComparisons={MOCK_COMPARISONS} />);

    const approveButtons = screen.getAllByRole("button", { name: /approve/i });
    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });

    expect(approveButtons).toHaveLength(2);
    expect(rejectButtons).toHaveLength(2);
  });

  it("shows empty state when no comparisons", () => {
    render(<SubmissionQueue initialComparisons={[]} />);

    expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
    expect(screen.getByText(/no pending submissions/i)).toBeInTheDocument();
  });

  it("shows reject reason textarea on Reject click", () => {
    render(<SubmissionQueue initialComparisons={MOCK_COMPARISONS} />);

    const rejectButtons = screen.getAllByRole("button", { name: /^reject$/i });
    fireEvent.click(rejectButtons[0]);

    expect(screen.getByPlaceholderText(/why is this being rejected/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm reject/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("hides reject textarea on Cancel click", () => {
    render(<SubmissionQueue initialComparisons={MOCK_COMPARISONS} />);

    const rejectButtons = screen.getAllByRole("button", { name: /^reject$/i });
    fireEvent.click(rejectButtons[0]);

    // Textarea should be visible
    expect(screen.getByPlaceholderText(/why is this being rejected/i)).toBeInTheDocument();

    // Cancel
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    // Textarea should be gone
    expect(screen.queryByPlaceholderText(/why is this being rejected/i)).not.toBeInTheDocument();
  });

  it("calls approve API and removes item optimistically", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ comparison: { id: "cmp-1" } }),
      })
    );

    render(<SubmissionQueue initialComparisons={MOCK_COMPARISONS} />);

    const approveButtons = screen.getAllByRole("button", { name: /approve/i });
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText(/Ibuprofen 200mg vs Advil 200mg/i)).not.toBeInTheDocument();
    });

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "/api/admin",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ action: "approve", comparisonId: "cmp-1" }),
      })
    );
  });

  it("calls reject API and removes item optimistically", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ comparison: { id: "cmp-2" } }),
      })
    );

    render(<SubmissionQueue initialComparisons={MOCK_COMPARISONS} />);

    // Click reject on second item
    const rejectButtons = screen.getAllByRole("button", { name: /^reject$/i });
    fireEvent.click(rejectButtons[1]);

    // Enter reason
    const textarea = screen.getByPlaceholderText(/why is this being rejected/i);
    fireEvent.change(textarea, { target: { value: "Low quality submission" } });

    // Confirm reject
    fireEvent.click(screen.getByRole("button", { name: /confirm reject/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Acetaminophen 500mg vs Tylenol 500mg/i)).not.toBeInTheDocument();
    });

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "/api/admin",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          action: "reject",
          comparisonId: "cmp-2",
          reason: "Low quality submission",
        }),
      })
    );
  });
});
