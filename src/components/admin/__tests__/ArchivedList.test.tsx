import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ArchivedList } from "../ArchivedList";

const archived = [
  { id: "a1", genericProductName: "Up & Up Acetaminophen", nameBrandProductName: "Tylenol", reason: "Store or brand not sold in Canada" },
  { id: "a2", genericProductName: "Equate Ranitidine", nameBrandProductName: "Zantac", reason: "Ranitidine was withdrawn from the Canadian market" },
];

describe("ArchivedList", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists archived comparisons with their reasons", () => {
    render(<ArchivedList initialArchived={archived} />);
    expect(screen.getByText(/show 2 archived comparisons/i)).toBeInTheDocument();
    expect(screen.getByText("Store or brand not sold in Canada")).toBeInTheDocument();
  });

  it("restores a comparison through the admin API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ArchivedList initialArchived={archived} />);

    fireEvent.click(screen.getAllByRole("button", { name: /restore/i })[0]);

    await waitFor(() => expect(screen.getAllByTestId("archived-item")).toHaveLength(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin",
      expect.objectContaining({ body: JSON.stringify({ action: "restore", comparisonId: "a1" }) })
    );
  });

  it("shows an empty state", () => {
    render(<ArchivedList initialArchived={[]} />);
    expect(screen.getByText(/nothing is archived/i)).toBeInTheDocument();
  });
});
