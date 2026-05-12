// POST /api/admin/zen-elevate
//
// Step-up auth for ZenMode entry. Even with an active Better Auth session
// and is_admin=true, /ZenMode requires a fresh password re-verify on every
// entry (or every 30 min if you stay inside). This route does the verify
// and sets the short-TTL elevation cookie.
//
// Request body:  { email: string, password: string }
// Response:      { ok: true } + Set-Cookie zenmode_elevated=<signed payload>
//                { ok: false, error: "..." } on failure
//
// Errors that 4xx the client (never reveal which of {email, password,
// is_admin} was wrong — same "invalid credentials" for all three):
//   - missing fields
//   - signInEmail rejects
//   - profiles.is_admin = false
//
// We deliberately keep error messages generic to avoid leaking who's an admin.

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { mintElevationCookie, serializeElevationCookie } from "@/lib/zenmode-elevate"

export const dynamic = "force-dynamic"

let cached: SupabaseClient | null = null
function admin(): SupabaseClient {
  if (!cached) {
    cached = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return cached
}

const FAIL = { ok: false, error: "invalid_credentials" }
const FAIL_STATUS = 401

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(FAIL, { status: FAIL_STATUS })
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body.password === "string" ? body.password : ""
  if (!email || !password) {
    return NextResponse.json(FAIL, { status: FAIL_STATUS })
  }

  // Verify password with Better Auth. signInEmail creates a fresh session
  // as a side-effect, which is fine — the existing /api/auth cookies get
  // refreshed. If the email/password is wrong this throws or returns null.
  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
      asResponse: false,
    })
    if (!result?.user?.id) {
      return NextResponse.json(FAIL, { status: FAIL_STATUS })
    }

    // Re-confirm is_admin via service-role client (the user shouldn't be
    // able to elevate at all if they're not an admin, regardless of any
    // client-side flag).
    const { data: profile, error } = await admin()
      .from("profiles")
      .select("is_admin")
      .eq("id", result.user.id)
      .single()
    if (error || !profile?.is_admin) {
      return NextResponse.json(FAIL, { status: FAIL_STATUS })
    }

    const cookie = mintElevationCookie(result.user.id)
    const setCookie = serializeElevationCookie(cookie.value, cookie.expiresAt)
    return new NextResponse(JSON.stringify({ ok: true, expires_at: cookie.expiresAt }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": setCookie,
        "Cache-Control": "no-store",
      },
    })
  } catch (e) {
    console.warn("[zen-elevate] failure:", (e as Error).message)
    return NextResponse.json(FAIL, { status: FAIL_STATUS })
  }
}
