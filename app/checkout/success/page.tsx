"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

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

const cta: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 32px",
  background: "linear-gradient(135deg,#7c3aed,#c026d3)",
  color: "#fff",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 600,
}

function SuccessInner() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const sessionId = params.get("session_id")
    if (!sessionId) {
      router.push("/account")
      return
    }
    fetch("/api/checkout/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStatus("success")
          setMessage(
            d.type === "subscription"
              ? `Subscription active: ${d.plan}.`
              : `Added ${d.minutes} minutes.`,
          )
          setTimeout(() => router.push("/account"), 2200)
        } else {
          setStatus("error")
          setMessage(d.error || "Could not verify payment")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Verification failed")
      })
  }, [params, router])

  return (
    <main style={wrap}>
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>
          {status === "verifying"
            ? "Verifying payment…"
            : status === "success"
              ? "Payment successful"
              : "Verification issue"}
        </h1>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>
          {message || "One moment…"}
        </p>
        <a href="/account" style={cta}>
          Go to your account
        </a>
      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<main style={wrap} />}>
      <SuccessInner />
    </Suspense>
  )
}
