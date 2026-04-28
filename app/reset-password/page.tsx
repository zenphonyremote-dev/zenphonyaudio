"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ZenphonyLogo } from "@/components/zenphony-logo"
import { authClient } from "@/lib/auth-client"
import { Suspense } from "react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Better Auth passes the token in the URL
  const token = searchParams.get("token")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      })

      if (error) {
        setError(error.message || "Failed to reset password")
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.")
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
              Password reset successful!
            </h1>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>

            <p className="text-sm text-white/50 mb-6">
              Redirecting to sign in...
            </p>

            <Link href="/login">
              <Button
                className="w-full rounded-full text-white font-bold lb-talk-btn"
              >
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // No token = invalid link
  if (!token) {
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
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <Lock className="w-12 h-12 text-red-400" />
              </div>
            </div>

            <h1 className="text-3xl font-black text-foreground mb-3">
              Invalid or expired link
            </h1>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            <div className="space-y-3">
              <Link href="/forgot-password">
                <Button
                  className="w-full rounded-full text-white font-bold lb-talk-btn"
                >
                  Request new link
                </Button>
              </Link>

              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-border/30 text-foreground hover:bg-white/[0.06] bg-transparent"
                >
                  Back to Sign In
                </Button>
              </Link>
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
            Set new password
          </h1>
          <p className="text-muted-foreground mb-8 text-center">
            Your new password must be at least 8 characters.
          </p>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 h-14 rounded-2xl bg-white/[0.05] border-white/10 text-foreground placeholder:text-white/40"
                  style={{ ["--tw-ring-color" as string]: "var(--lb-primary)" }}
                  placeholder="New password"
                  required
                  minLength={8}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-white/40 mt-2 ml-1">Must be at least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-12 h-14 rounded-2xl bg-white/[0.05] border-white/10 text-foreground placeholder:text-white/40"
                style={{ ["--tw-ring-color" as string]: "var(--lb-primary)" }}
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl text-white font-bold text-base transition-all duration-300 border-0 disabled:opacity-50 lb-talk-btn"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
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

function ResetPasswordLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--lb-primary)" }} />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
