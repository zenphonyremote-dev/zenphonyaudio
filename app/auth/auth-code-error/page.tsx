"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

const wrap: React.CSSProperties = {
  display: "grid",
  placeItems: "center",
  minHeight: "100vh",
  padding: 24,
  color: "#fff",
  background: "#0a0a14",
  textAlign: "center",
  fontFamily: "Inter, system-ui, sans-serif",
}

function ErrorMessage() {
  const params = useSearchParams()
  const raw = params.get("error")
  const msg = raw
    ? decodeURIComponent(raw)
    : "There was an issue completing sign-in. The link may have expired or is invalid."
  return <p style={{ opacity: 0.7, marginBottom: 24 }}>{msg}</p>
}

export default function AuthCodeErrorPage() {
  return (
    <main style={wrap}>
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>Sign-in failed</h1>
        <Suspense fallback={<p style={{ opacity: 0.7, marginBottom: 24 }}>Please try again.</p>}>
          <ErrorMessage />
        </Suspense>
        <a
          href="/account"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            background: "linear-gradient(135deg,#7c3aed,#c026d3)",
            color: "#fff",
            borderRadius: 12,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Back to sign in
        </a>
      </div>
    </main>
  )
}
