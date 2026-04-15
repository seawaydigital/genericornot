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
    <html>
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#fafaf8",
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
              fontSize: "72px",
              fontWeight: 700,
              color: "#e5e7eb",
              margin: 0,
            }}
          >
            !
          </p>
          <h1
            style={{
              marginTop: "16px",
              fontSize: "24px",
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred. Please try again.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: "12px",
                color: "#d1d5db",
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
              background: "linear-gradient(to bottom, #0d1b4a, #162d6b)",
              color: "white",
              border: "none",
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
