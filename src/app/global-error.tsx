"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error-boundary]", error);
  }, [error]);

  return (
    <html lang="en-CA">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#f6f4ee",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <div style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
          <p
            style={{
              display: "inline-block",
              fontSize: "28px",
              fontWeight: 700,
              color: "#0d1b4a",
              background: "#ffd23f",
              borderRadius: "10px",
              padding: "6px 16px",
              margin: 0,
              transform: "rotate(-6deg)",
            }}
          >
            !
          </p>
          <h1
            style={{
              marginTop: "16px",
              fontSize: "28px",
              fontWeight: 700,
              color: "#0b1533",
              letterSpacing: "-0.02em",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              marginTop: "8px",
              color: "#545a6c",
              fontSize: "16px",
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred. Please try again.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: "12px",
                color: "#666c7f",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
            >
              ref: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "32px",
              background: "#0d1b4a",
              color: "white",
              border: "none",
              minHeight: "44px",
              padding: "12px 24px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
