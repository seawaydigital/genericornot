import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VerdictBadge } from "../VerdictBadge";

describe("VerdictBadge", () => {
  describe("renders correct label for each verdict", () => {
    it("renders 'Same Quality' for SAME_QUALITY", () => {
      render(<VerdictBadge verdict="SAME_QUALITY" />);
      expect(screen.getByText("Same Quality")).toBeInTheDocument();
    });

    it("renders 'Close Enough' for CLOSE_ENOUGH", () => {
      render(<VerdictBadge verdict="CLOSE_ENOUGH" />);
      expect(screen.getByText("Close Enough")).toBeInTheDocument();
    });

    it("renders 'Not Worth It' for NOT_WORTH_IT", () => {
      render(<VerdictBadge verdict="NOT_WORTH_IT" />);
      expect(screen.getByText("Not Worth It")).toBeInTheDocument();
    });

    it("renders 'Mixed' for MIXED", () => {
      render(<VerdictBadge verdict="MIXED" />);
      expect(screen.getByText("Mixed")).toBeInTheDocument();
    });

    it("renders 'Pending' for PENDING", () => {
      render(<VerdictBadge verdict="PENDING" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });
  });

  describe("uses correct color variant for each verdict", () => {
    it("uses success (green) variant for SAME_QUALITY", () => {
      const { container } = render(<VerdictBadge verdict="SAME_QUALITY" />);
      const badge = container.querySelector("span");
      expect(badge?.className).toContain("emerald");
    });

    it("uses warning (amber) variant for CLOSE_ENOUGH", () => {
      const { container } = render(<VerdictBadge verdict="CLOSE_ENOUGH" />);
      const badge = container.querySelector("span");
      expect(badge?.className).toContain("amber");
    });

    it("uses danger (red) variant for NOT_WORTH_IT", () => {
      const { container } = render(<VerdictBadge verdict="NOT_WORTH_IT" />);
      const badge = container.querySelector("span");
      expect(badge?.className).toContain("red");
    });

    it("uses neutral (gray) variant for MIXED", () => {
      const { container } = render(<VerdictBadge verdict="MIXED" />);
      const badge = container.querySelector("span");
      expect(badge?.className).toContain("gray");
    });

    it("uses neutral (gray) variant for PENDING", () => {
      const { container } = render(<VerdictBadge verdict="PENDING" />);
      const badge = container.querySelector("span");
      expect(badge?.className).toContain("gray");
    });
  });

  describe("respects size prop", () => {
    it("applies text-xs for size='sm'", () => {
      const { container } = render(<VerdictBadge verdict="SAME_QUALITY" size="sm" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper?.className).toContain("text-xs");
    });

    it("applies text-sm for size='md' (default)", () => {
      const { container } = render(<VerdictBadge verdict="SAME_QUALITY" size="md" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper?.className).toContain("text-sm");
    });

    it("defaults to md size when size prop is omitted", () => {
      const { container } = render(<VerdictBadge verdict="SAME_QUALITY" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper?.className).toContain("text-sm");
    });
  });
});
