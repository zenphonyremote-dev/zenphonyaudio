// lib/zenmode-elevate.ts
//
// ZenMode "sudo mode" — every entry into /ZenMode requires explicit password
// re-verification, even with an otherwise-valid Better Auth session and
// is_admin=true. This protects against an attacker who hijacks a regular
// authenticated browser session (e.g. via XSS, stolen cookie) from being
// able to walk straight into the admin console.
//
// Mechanism: after a successful password re-verify, we set a short-TTL
// HMAC-signed cookie. /ZenMode checks for it on every render; if missing
// or expired it serves the elevation form instead of the admin shell.
//
// Cookie is HttpOnly + Secure + SameSite=Lax + Path=/. We don't trust
// the cookie value alone — the HMAC ensures it can't be forged by anyone
// without ZENMODE_ELEVATE_SECRET (or, by fallback, SUPABASE_SERVICE_ROLE_KEY).
//
// 2026-05-14: relaxed from SameSite=Strict to SameSite=Lax. Strict blocked
// the cookie on bookmark clicks + cross-tab navigation from external pages
// (e.g. mail-link → /ZenMode), which the admin uses routinely. Lax still
// withholds the cookie on cross-site POST/PUT/DELETE (CSRF protection is
// preserved), and the HMAC + 30-min TTL + DB is_admin check provide the
// real authorization gate. Net result: bookmark clicks land correctly,
// CSRF attack surface unchanged.

import crypto from "node:crypto"

export const ZENMODE_COOKIE_NAME = "zenmode_elevated"
export const ZENMODE_TTL_MS = 30 * 60 * 1000 // 30 minutes

function getSecret(): string {
  const explicit = process.env.ZENMODE_ELEVATE_SECRET
  if (explicit && explicit.length >= 16) return explicit
  // Fallback so we don't require an extra env var to deploy. The service
  // role key is already high-entropy and admin-only — adequate for HMAC.
  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (fallback && fallback.length >= 16) return fallback
  throw new Error(
    "ZenMode elevation: no signing secret (set ZENMODE_ELEVATE_SECRET or SUPABASE_SERVICE_ROLE_KEY)",
  )
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url")
}

/**
 * Build a fresh elevation cookie value for the given user. Includes user_id
 * (so the cookie is bound to that account) and an absolute expiry timestamp.
 */
export function mintElevationCookie(userId: string): { name: string; value: string; expiresAt: number } {
  const expiresAt = Date.now() + ZENMODE_TTL_MS
  const payload = `${userId}.${expiresAt}`
  const sig = sign(payload)
  return {
    name: ZENMODE_COOKIE_NAME,
    value: `${payload}.${sig}`,
    expiresAt,
  }
}

export type ElevationCheck =
  | { ok: true; userId: string; expiresAt: number }
  | { ok: false; reason: "missing" | "malformed" | "bad_signature" | "expired" }

/**
 * Verify a raw cookie value. Returns { ok, userId, expiresAt } if the cookie
 * is well-formed, the HMAC matches, AND the cookie hasn't expired. Otherwise
 * a reason code the route can act on (e.g. just re-show the form).
 */
export function verifyElevationCookie(raw: string | null | undefined): ElevationCheck {
  if (!raw) return { ok: false, reason: "missing" }
  const parts = raw.split(".")
  if (parts.length !== 3) return { ok: false, reason: "malformed" }
  const [userId, expiresAtStr, sig] = parts
  const expiresAt = Number(expiresAtStr)
  if (!userId || !Number.isFinite(expiresAt)) return { ok: false, reason: "malformed" }

  const expectedSig = sign(`${userId}.${expiresAt}`)
  // Constant-time compare to avoid timing-leak on the HMAC tag.
  const a = Buffer.from(sig)
  const b = Buffer.from(expectedSig)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" }
  }
  if (Date.now() > expiresAt) return { ok: false, reason: "expired" }

  return { ok: true, userId, expiresAt }
}

/**
 * Serialize a Set-Cookie header value for the elevation cookie. Kept here so
 * the route handler doesn't have to remember the security attributes.
 */
export function serializeElevationCookie(value: string, expiresAt: number): string {
  const expires = new Date(expiresAt).toUTCString()
  return [
    `${ZENMODE_COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Expires=${expires}`,
  ].join("; ")
}

/** Returns a Set-Cookie header that immediately expires the elevation cookie. */
export function clearElevationCookie(): string {
  return [
    `${ZENMODE_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "Max-Age=0",
  ].join("; ")
}
