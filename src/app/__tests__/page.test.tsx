import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "../page";

describe("Homepage", () => {
  it("renders the site name", () => {
    render(<Home />);
    expect(
      screen.getByText((_, element) => {
        return element?.textContent?.replace(/\s+/g, "") === "GenericOrNot";
      })
    ).toBeInTheDocument();
  });
});
