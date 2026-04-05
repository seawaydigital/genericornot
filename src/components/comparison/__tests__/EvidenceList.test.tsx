import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EvidenceList } from "../EvidenceList";

function makeEvidence(overrides: Partial<{
  id: string;
  type: string;
  title: string;
  content: string;
  url: string | null;
  createdAt: string;
  user: { username: string };
}> = {}) {
  return {
    id: "ev-1",
    type: "OTHER",
    title: "Test Evidence",
    content: "Some content here",
    url: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    user: { username: "testuser" },
    ...overrides,
  };
}

describe("EvidenceList", () => {
  it("renders evidence entries", () => {
    const evidence = [makeEvidence({ content: "First piece of evidence" })];
    render(<EvidenceList evidence={evidence} />);
    expect(screen.getByText("First piece of evidence")).toBeInTheDocument();
  });

  it("renders contributor username", () => {
    const evidence = [makeEvidence({ user: { username: "jane_doe" } })];
    render(<EvidenceList evidence={evidence} />);
    expect(screen.getByText("jane_doe")).toBeInTheDocument();
  });

  it("renders URL link when url is present", () => {
    const evidence = [makeEvidence({ url: "https://example.com" })];
    render(<EvidenceList evidence={evidence} />);
    const link = screen.getByRole("link", { name: /view source/i });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("does not render link when url is null", () => {
    const evidence = [makeEvidence({ url: null })];
    render(<EvidenceList evidence={evidence} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows 3 entries by default when more than 3 exist", () => {
    const evidence = Array.from({ length: 5 }, (_, i) =>
      makeEvidence({ id: `ev-${i}`, content: `Evidence ${i + 1}` })
    );
    render(<EvidenceList evidence={evidence} />);
    expect(screen.getByText("Evidence 1")).toBeInTheDocument();
    expect(screen.getByText("Evidence 3")).toBeInTheDocument();
    expect(screen.queryByText("Evidence 4")).not.toBeInTheDocument();
    expect(screen.queryByText("Evidence 5")).not.toBeInTheDocument();
  });

  it("shows 'Show all (N)' button when more than 3 evidence entries", () => {
    const evidence = Array.from({ length: 5 }, (_, i) =>
      makeEvidence({ id: `ev-${i}`, content: `Evidence ${i + 1}` })
    );
    render(<EvidenceList evidence={evidence} />);
    expect(screen.getByRole("button", { name: /show all \(5\)/i })).toBeInTheDocument();
  });

  it("does not show 'Show all' button when 3 or fewer entries", () => {
    const evidence = [
      makeEvidence({ id: "ev-1", content: "First" }),
      makeEvidence({ id: "ev-2", content: "Second" }),
      makeEvidence({ id: "ev-3", content: "Third" }),
    ];
    render(<EvidenceList evidence={evidence} />);
    expect(screen.queryByRole("button", { name: /show all/i })).not.toBeInTheDocument();
  });

  it("reveals all entries after clicking 'Show all'", () => {
    const evidence = Array.from({ length: 5 }, (_, i) =>
      makeEvidence({ id: `ev-${i}`, content: `Evidence ${i + 1}` })
    );
    render(<EvidenceList evidence={evidence} />);
    fireEvent.click(screen.getByRole("button", { name: /show all/i }));
    expect(screen.getByText("Evidence 4")).toBeInTheDocument();
    expect(screen.getByText("Evidence 5")).toBeInTheDocument();
  });

  it("handles empty evidence array", () => {
    render(<EvidenceList evidence={[]} />);
    expect(screen.getByText(/No evidence submitted yet/)).toBeInTheDocument();
  });

  it("renders correct type badge label for MANUFACTURER_INFO", () => {
    const evidence = [makeEvidence({ type: "MANUFACTURER_INFO" })];
    render(<EvidenceList evidence={evidence} />);
    expect(screen.getByText("Manufacturer Info")).toBeInTheDocument();
  });

  it("renders correct type badge label for INGREDIENT_COMPARISON", () => {
    const evidence = [makeEvidence({ type: "INGREDIENT_COMPARISON" })];
    render(<EvidenceList evidence={evidence} />);
    expect(screen.getByText("Ingredients")).toBeInTheDocument();
  });

  it("renders correct type badge label for VIDEO_LINK", () => {
    const evidence = [makeEvidence({ type: "VIDEO_LINK" })];
    render(<EvidenceList evidence={evidence} />);
    expect(screen.getByText("Video")).toBeInTheDocument();
  });
});
