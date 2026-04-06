import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VoteBreakdown } from "../VoteBreakdown";

describe("VoteBreakdown", () => {
  it("renders percentage labels for each category", () => {
    render(
      <VoteBreakdown
        sameQuality={6}
        closeEnough={3}
        notWorthIt={1}
        totalVotes={10}
      />
    );
    expect(screen.getByText(/same quality/i)).toBeInTheDocument();
    expect(screen.getByText(/close enough/i)).toBeInTheDocument();
    expect(screen.getByText(/not worth it/i)).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("renders correct percentages", () => {
    render(
      <VoteBreakdown
        sameQuality={2}
        closeEnough={2}
        notWorthIt={1}
        totalVotes={5}
      />
    );
    // 2/5 = 40% for both same quality and close enough — use getAllByText
    const fortyPct = screen.getAllByText("40%");
    expect(fortyPct).toHaveLength(2);
    expect(screen.getByText("20%")).toBeInTheDocument();
  });

  it("handles 0 votes by showing empty gray bar", () => {
    const { container } = render(
      <VoteBreakdown
        sameQuality={0}
        closeEnough={0}
        notWorthIt={0}
        totalVotes={0}
      />
    );
    // Bar background should be visible
    const bar = container.querySelector(".rounded-full");
    expect(bar).toBeInTheDocument();
    expect(bar?.className).toContain("bg-gray-200");
    // All percentages are 0%
    const zeros = screen.getAllByText("0%");
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  it("handles 0 votes without crashing (no division by zero)", () => {
    expect(() =>
      render(
        <VoteBreakdown
          sameQuality={0}
          closeEnough={0}
          notWorthIt={0}
          totalVotes={0}
        />
      )
    ).not.toThrow();
  });

  it("renders stacked bar with colored segments for non-zero votes", () => {
    const { container } = render(
      <VoteBreakdown
        sameQuality={5}
        closeEnough={3}
        notWorthIt={2}
        totalVotes={10}
      />
    );
    const emeraldSegment = container.querySelector(".bg-emerald-500");
    const amberSegment = container.querySelector(".bg-amber-500");
    const redSegment = container.querySelector(".bg-red-500");
    expect(emeraldSegment).toBeInTheDocument();
    expect(amberSegment).toBeInTheDocument();
    expect(redSegment).toBeInTheDocument();
  });
});
