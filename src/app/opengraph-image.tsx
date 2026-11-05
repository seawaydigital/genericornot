import { ImageResponse } from "next/og";

export const alt = "GenericOrNot — Is the store brand worth it? Canadian shoppers compare.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#0d1b4a",
          color: "white",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>
          Generic<span style={{ fontStyle: "italic", margin: "0 10px" }}>Or</span>Not
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Is the store brand worth it?
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#c7d2fe", lineHeight: 1.35 }}>
            No Name, PC, Great Value, Kirkland, Life Brand and more — compared with the name brands by Canadian shoppers.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#a5b4fc" }}>
          <span>genericornot.com</span>
          <span>Real votes · Canadian prices · Evidence</span>
        </div>
      </div>
    ),
    size
  );
}
