import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VoteButtons } from "../VoteButtons";

describe("VoteButtons", () => {
  it("renders the three vote options", () => {
    render(<VoteButtons currentVote={null} onVote={vi.fn()} />);
    expect(screen.getByRole("button", { name: /same quality/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close enough/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /not worth it/i })).toBeInTheDocument();
  });

  it("marks the current vote as pressed and highlighted", () => {
    render(<VoteButtons currentVote="SAME_QUALITY" onVote={vi.fn()} />);
    const same = screen.getByRole("button", { name: /same quality/i });
    expect(same).toHaveAttribute("aria-pressed", "true");
    expect(same.className).toContain("bg-good-bg");
    expect(screen.getByRole("button", { name: /close enough/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onVote with the chosen value", () => {
    const onVote = vi.fn();
    render(<VoteButtons currentVote={null} onVote={onVote} />);
    fireEvent.click(screen.getByRole("button", { name: /not worth it/i }));
    expect(onVote).toHaveBeenCalledWith("NOT_WORTH_IT");
  });

  it("disables every option while disabled", () => {
    render(<VoteButtons currentVote={null} onVote={vi.fn()} disabled />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });

  it("groups the buttons for assistive technology", () => {
    render(<VoteButtons currentVote={null} onVote={vi.fn()} />);
    expect(screen.getByRole("group", { name: /your vote/i })).toBeInTheDocument();
  });
});
