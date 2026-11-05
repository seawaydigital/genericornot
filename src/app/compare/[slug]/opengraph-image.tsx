import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { computeSavings, getDisplayVerdict } from "@/lib/verdict";
import { verdictLabel } from "@/lib/verdict-labels";
import { decimalToNumber } from "@/lib/comparisons";

export const alt = "GenericOrNot comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

const VERDICT_COLOURS: Record<string, { bg: string; fg: string }> = {
  SAME_QUALITY: { bg: "#d1fae5", fg: "#065f46" },
  CLOSE_ENOUGH: { bg: "#fef3c7", fg: "#92400e" },
  NOT_WORTH_IT: { bg: "#fee2e2", fg: "#991b1b" },
  MIXED: { bg: "#e5e7eb", fg: "#374151" },
  PENDING: { bg: "#e5e7eb", fg: "#374151" },
};

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let comparison = null;
  try {
    comparison = await prisma.productComparison.findUnique({ where: { slug } });
  } catch {
    comparison = null;
  }

  if (!comparison || comparison.status !== "APPROVED") {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1b4a", color: "white", fontSize: 64, fontWeight: 700 }}>
          GenericOrNot
        </div>
      ),
      size
    );
  }

  const display = getDisplayVerdict(comparison);
  const savings = computeSavings(
    decimalToNumber(comparison.genericPrice),
    decimalToNumber(comparison.nameBrandPrice),
    comparison.genericSize,
    comparison.nameBrandSize
  );
  const colours = VERDICT_COLOURS[display.verdict] ?? VERDICT_COLOURS.PENDING;
  const sourceLabel =
    display.source === "community"
      ? `Community verdict · ${comparison.totalVotes} votes`
      : display.source === "research"
        ? "Research verdict · vote on genericornot.com"
        : "Be one of the first to vote";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#fafaf8",
          color: "#0d1b4a",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30 }}>
          <div style={{ display: "flex", fontWeight: 600 }}>
            Generic<span style={{ fontStyle: "italic", margin: "0 8px" }}>Or</span>Not
          </div>
          <div style={{ display: "flex", color: "#6b7280", fontSize: 24 }}>Canadian shoppers compare</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 30, color: "#6b7280" }}>
            {truncate(`${comparison.genericBrand} (${comparison.genericStore})`, 60)} vs
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5 }}>
            {truncate(comparison.nameBrandProductName, 60)}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12, alignItems: "center" }}>
            <div style={{ display: "flex", padding: "12px 28px", borderRadius: 999, background: colours.bg, color: colours.fg, fontSize: 36, fontWeight: 700 }}>
              {verdictLabel(display.verdict)}
            </div>
            {savings !== null && savings > 0 && display.verdict !== "NOT_WORTH_IT" && (
              <div style={{ display: "flex", padding: "12px 28px", borderRadius: 999, background: "#d1fae5", color: "#065f46", fontSize: 36, fontWeight: 700 }}>
                Save {savings}%
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#6b7280" }}>
          <span>{sourceLabel}</span>
          <span>genericornot.com</span>
        </div>
      </div>
    ),
    size
  );
}
