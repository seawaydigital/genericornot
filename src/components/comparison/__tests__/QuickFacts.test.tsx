import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { QuickFacts } from "../QuickFacts";

describe("QuickFacts", () => {
  it("shows 'Same Manufacturer' fact when MANUFACTURER_INFO evidence exists", () => {
    const evidence = [{ type: "MANUFACTURER_INFO" }];
    render(<QuickFacts evidence={evidence} />);
    expect(screen.getByText("Same Manufacturer")).toBeInTheDocument();
  });

  it("shows 'Ingredients Compared' fact when INGREDIENT_COMPARISON evidence exists", () => {
    const evidence = [{ type: "INGREDIENT_COMPARISON" }];
    render(<QuickFacts evidence={evidence} />);
    expect(screen.getByText("Ingredients Compared")).toBeInTheDocument();
  });

  it("shows 'Video Review' fact when VIDEO_LINK evidence exists", () => {
    const evidence = [{ type: "VIDEO_LINK" }];
    render(<QuickFacts evidence={evidence} />);
    expect(screen.getByText("Video Review")).toBeInTheDocument();
  });

  it("shows multiple facts when multiple relevant evidence types exist", () => {
    const evidence = [
      { type: "MANUFACTURER_INFO" },
      { type: "INGREDIENT_COMPARISON" },
      { type: "VIDEO_LINK" },
    ];
    render(<QuickFacts evidence={evidence} />);
    expect(screen.getByText("Same Manufacturer")).toBeInTheDocument();
    expect(screen.getByText("Ingredients Compared")).toBeInTheDocument();
    expect(screen.getByText("Video Review")).toBeInTheDocument();
  });

  it("deduplicates facts when multiple evidence of same type exists", () => {
    const evidence = [{ type: "MANUFACTURER_INFO" }, { type: "MANUFACTURER_INFO" }];
    render(<QuickFacts evidence={evidence} />);
    expect(screen.getAllByText("Same Manufacturer")).toHaveLength(1);
  });

  it("shows 'No details yet' message when no evidence", () => {
    render(<QuickFacts evidence={[]} />);
    expect(screen.getByText(/No details yet/)).toBeInTheDocument();
  });

  it("shows confidence badge label when facts exist", () => {
    const evidence = [{ type: "MANUFACTURER_INFO", confidence: "CONFIRMED" }];
    render(<QuickFacts evidence={evidence} />);
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("does not show facts when only PHOTO or OTHER evidence exists", () => {
    const evidence = [{ type: "PHOTO" }, { type: "OTHER" }];
    render(<QuickFacts evidence={evidence} />);
    expect(screen.queryByText("Same Manufacturer")).not.toBeInTheDocument();
    expect(screen.queryByText("Ingredients Compared")).not.toBeInTheDocument();
    expect(screen.queryByText("Video Review")).not.toBeInTheDocument();
    // Should fall through to "no details yet" since no facts were derived
    expect(screen.getByText(/No details yet/)).toBeInTheDocument();
  });
});
