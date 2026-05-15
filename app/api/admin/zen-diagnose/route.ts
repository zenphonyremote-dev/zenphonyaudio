// GET /api/admin/zen-diagnose
//
// Temporary diagnostic endpoint that surfaces the exact state of
// `auth.api.getSession({ headers })` from /ZenMode's perspective. Use when
// /ZenMode redirects with ?zenmode_reason=unauthorized despite the user
// having an active session per /account. Reveals which of:
//   - cookie header missing entirely
//   - cookie header present but session cookie name mismatch
//   - cookie sent but Better Auth can't validate it (DB lookup fails)
//   - getSession returns partial shape (user undefined / session undefined)
//
// Output is JSON. Doesn't reveal sensitive values (cookie values are NEVER
// returned — only names). Once we pinpoint the bug, this endpoint can be
// removed.

import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const h = await headers()
  const cookieHeader = h.get("cookie")
  const cookieNames = cookieHeader
    ? cookieHeader.split(";").map((c) => c.trim().split("=")[0])
    : []

  let getSessionResult: {
    error?: string
    isNull?: boolean
    keys?: string[]
    hasUser?: boolean
    hasSession?: boolean
    userId?: string
    sessionId?: string
    sessionCreatedAt?: string
    sessionExpiresAt?: string
  } = {}

  try {
    const session = await auth.api.getSession({ headers: h })
    if (!session) {
      getSessionResult.isNull = true
    } else {
      getSessionResult.isNull = false
      getSessionResult.keys = Object.keys(session as object)
      const s = session as {
        user?: { id?: string }
        session?: { id?: string; createdAt?: string; expiresAt?: string }
      }
      getSessionResult.hasUser = !!s.user
      getSessionResult.hasSession = !!s.session
      getSessionResult.userId = s.user?.id
      getSessionResult.sessionId = s.session?.id
      getSessionResult.sessionCreatedAt = String(s.session?.createdAt ?? "")
      getSessionResult.sessionExpiresAt = String(s.session?.expiresAt ?? "")
    }
  } catch (e) {
    getSessionResult.error = (e as Error).message
  }

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      request: {
        hasCookieHeader: !!cookieHeader,
        cookieHeaderLength: cookieHeader?.length ?? 0,
        cookieNames,
        // BA's expected cookie names (for HTTPS prod and dev):
        possibleSessionCookies: cookieNames.filter(
          (n) =>
            n.includes("session_token") ||
            n.includes("better-auth") ||
            n.includes("Secure-better"),
        ),
      },
      getSession: getSessionResult,
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  )
}
