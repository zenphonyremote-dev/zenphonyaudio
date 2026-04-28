"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Loader2, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ZenphonyLogo } from "@/components/zenphony-logo"
import { authClient } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null)

  // Countdown timer for rate limit
  useEffect(() => {
    if (rateLimitCountdown === null || rateLimitCountdown <= 0) return

    const timer = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev === null || prev <= 1) {
          setError(null)
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [rateLimitCountdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Please enter your email address")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const { error } = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      })

      if (error) {
        const errorMsg = (error.message || "").toLowerCase()
        const isRateLimit = errorMsg.includes('rate limit') ||
                           errorMsg.includes('too many')

        if (isRateLimit) {
          setError("Email rate limit exceeded. Please wait before trying again.")
          setRateLimitCountdown(60)
        } else {
          setError(error.message || "Failed to send reset email")
        }
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error('Error sending reset email:', err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden lb-aurora">

        {/* Floating glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none" style={{
          background: "radial-gradient(circle, hsla(var(--hue), 90%, 65%, 0.12), transparent 60%)",
          transform: "translate(calc(-50% + var(--atle-fx)), calc(-50% + var(--atle-fy)))"
        }} />

        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-[color:var(--lb-accent)] transition-colors z-10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="relative z-10 w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <ZenphonyLogo className="h-10 w-auto" variant="light" />
          </div>

          <div className="rounded-3xl lb-glass-strong p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
            </div>

            <h1 className="text-3xl font-black text-foreground mb-3">
              Check your email
            </h1>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              We've sent a password reset link to <span className="font-medium" style={{ color: "var(--lb-accent)" }}>{email}</span>.
              Click the link in the email to reset your password.
            </p>

            <div className="rounded-xl p-4 mb-6" style={{ background: "hsla(var(--hue), 90%, 65%, 0.1)", border: "1px solid hsla(var(--hue), 90%, 65%, 0.2)" }}>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "var(--lb-accent)" }} />
                <div className="text-left">
                  <p className="text-sm text-foreground font-medium mb-1">
                    Didn't receive the email?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Check your <span style={{ color: "var(--lb-accent)" }}>Spam folder</span> or <span style={{ color: "var(--lb-accent)" }}>All Mail</span>, or try again with a different email.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/login">
                <Button
                  className="w-full rounded-full text-white font-bold lb-talk-btn"
                >
                  Back to Sign In
                </Button>
              </Link>

              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail("")
                }}
                className="w-full text-sm hover:underline"
                style={{ color: "var(--lb-accent)" }}
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden lb-aurora">

      {/* Floating glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none" style={{
        background: "radial-gradient(circle, hsla(var(--hue), 90%, 65%, 0.12), transparent 60%)",
        transform: "translate(calc(-50% + var(--atle-fx)), calc(-50% + var(--atle-fy)))"
      }} />

      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-[color:var(--lb-accent)] transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <ZenphonyLogo className="h-10 w-auto" variant="light" />
        </div>

        <div className="rounded-3xl lb-glass-strong p-8">
          <h1 className="text-3xl font-black text-foreground mb-2 text-center">
            Forgot password?
          </h1>
          <p className="text-muted-foreground mb-8 text-center">
            No worries, we'll send you reset instructions.
          </p>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6">
              <div className="flex items-start gap-3">
                {rateLimitCountdown !== null && (
                  <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p>{error}</p>
                  {rateLimitCountdown !== null && (
                    <p className="mt-2 text-amber-400 font-medium">
                      Try again in {rateLimitCountdown} second{rateLimitCountdown !== 1 ? 's' : ''}
                    </p>
                  )}
                  {rateLimitCountdown !== null && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Supabase allows 4 password reset emails per hour.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 h-14 rounded-2xl bg-white/[0.05] border-white/10 text-foreground placeholder:text-white/40 focus-visible:ring-[color:var(--lb-primary)] focus-visible:border-[color:var(--lb-primary)]"
                style={{ ["--tw-ring-color" as string]: "var(--lb-primary)" }}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || rateLimitCountdown !== null}
              className="w-full h-14 rounded-2xl text-white font-bold text-base transition-all duration-300 border-0 disabled:opacity-50 lb-talk-btn"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : rateLimitCountdown !== null ? (
                `Wait ${rateLimitCountdown}s`
              ) : (
                "Reset password"
              )}
            </Button>
          </form>

          <p className="text-center text-white/50 mt-8">
            Remember your password?{" "}
            <Link href="/login" className="hover:underline font-medium" style={{ color: "var(--lb-accent)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
