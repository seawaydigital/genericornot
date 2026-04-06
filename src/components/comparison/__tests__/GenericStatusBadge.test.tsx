import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GenericStatusBadge } from "../GenericStatusBadge";

describe("GenericStatusBadge", () => {
  it("renders 'Generic Worth It' for SAME_QUALITY", () => {
    render(<GenericStatusBadge verdict="SAME_QUALITY" savings={null} />);
    expect(screen.getByText("Generic Worth It")).toBeInTheDocument();
  });

  it("renders 'Close Enough' for CLOSE_ENOUGH", () => {
    render(<GenericStatusBadge verdict="CLOSE_ENOUGH" savings={null} />);
    expect(screen.getByText("Close Enough")).toBeInTheDocument();
  });

  it("renders 'Stick with Brand' for NOT_WORTH_IT", () => {
    render(<GenericStatusBadge verdict="NOT_WORTH_IT" savings={null} />);
    expect(screen.getByText("Stick with Brand")).toBeInTheDocument();
  });

  it("renders 'Mixed Reviews' for MIXED", () => {
    render(<GenericStatusBadge verdict="MIXED" savings={null} />);
    expect(screen.getByText("Mixed Reviews")).toBeInTheDocument();
  });

  it("renders 'Awaiting Votes' for PENDING", () => {
    render(<GenericStatusBadge verdict="PENDING" savings={null} />);
    expect(screen.getByText("Awaiting Votes")).toBeInTheDocument();
  });

  it("shows savings pill for SAME_QUALITY with savings > 0", () => {
    render(<GenericStatusBadge verdict="SAME_QUALITY" savings={40} />);
    expect(screen.getByText("Save 40%")).toBeInTheDocument();
  });

  it("shows savings pill for CLOSE_ENOUGH with savings > 0", () => {
    render(<GenericStatusBadge verdict="CLOSE_ENOUGH" savings={20} />);
    expect(screen.getByText("Save 20%")).toBeInTheDocument();
  });

  it("does not show savings pill for NOT_WORTH_IT", () => {
    render(<GenericStatusBadge verdict="NOT_WORTH_IT" savings={30} />);
    expect(screen.queryByText(/Save/)).not.toBeInTheDocument();
  });

  it("does not show savings pill when savings is null", () => {
    render(<GenericStatusBadge verdict="SAME_QUALITY" savings={null} />);
    expect(screen.queryByText(/Save/)).not.toBeInTheDocument();
  });

  it("does not show savings pill when savings is 0", () => {
    render(<GenericStatusBadge verdict="SAME_QUALITY" savings={0} />);
    expect(screen.queryByText(/Save/)).not.toBeInTheDocument();
  });

  it("renders ✓ icon for SAME_QUALITY", () => {
    render(<GenericStatusBadge verdict="SAME_QUALITY" savings={null} />);
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("renders ✗ icon for NOT_WORTH_IT", () => {
    render(<GenericStatusBadge verdict="NOT_WORTH_IT" savings={null} />);
    expect(screen.getByText("✗")).toBeInTheDocument();
  });

  it("falls back to PENDING for unknown verdict", () => {
    render(<GenericStatusBadge verdict="UNKNOWN_VERDICT" savings={null} />);
    expect(screen.getByText("Awaiting Votes")).toBeInTheDocument();
  });
});
