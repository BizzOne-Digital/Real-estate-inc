"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Georgia, serif", background: "#f0f2f6", color: "#29345f", margin: 0 }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div>
            <h1 style={{ fontSize: 40, fontWeight: 500, margin: 0 }}>Something went wrong.</h1>
            <p style={{ marginTop: 16 }}>Please refresh the page or try again shortly.</p>
            <button
              type="button"
              onClick={reset}
              style={{ marginTop: 24, background: "#29345f", color: "#fff", border: 0, padding: "12px 24px", cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
