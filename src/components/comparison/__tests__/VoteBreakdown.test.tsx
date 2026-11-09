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

  it("handles 0 votes by showing empty tracks", () => {
    const { container } = render(
      <VoteBreakdown
        sameQuality={0}
        closeEnough={0}
        notWorthIt={0}
        totalVotes={0}
      />
    );
    // Three empty tracks, no filled bars
    expect(container.querySelectorAll(".bg-paper-deep")).toHaveLength(3);
    expect(container.querySelector(".animate-bar")).not.toBeInTheDocument();
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

  it("renders one labelled bar per option, sized by its share", () => {
    render(
      <VoteBreakdown
        sameQuality={5}
        closeEnough={3}
        notWorthIt={2}
        totalVotes={10}
      />
    );
    const bar = (key: string) => screen.getByTestId(`breakdown-${key}`).querySelector<HTMLElement>(".animate-bar");
    expect(bar("SAME_QUALITY")).toHaveClass("bg-good");
    expect(bar("SAME_QUALITY")?.style.width).toBe("50%");
    expect(bar("CLOSE_ENOUGH")).toHaveClass("bg-close");
    expect(bar("CLOSE_ENOUGH")?.style.width).toBe("30%");
    expect(bar("NOT_WORTH_IT")).toHaveClass("bg-bad");
    expect(bar("NOT_WORTH_IT")?.style.width).toBe("20%");
  });
});
