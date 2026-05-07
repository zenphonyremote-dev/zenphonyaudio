import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { createClient as createAdminClient, SupabaseClient } from "@supabase/supabase-js"

const ADMIN_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000 // 8 hours from session creation

export type AdminCheckResult =
  | {
      ok: true
      user: { id: string; email: string }
      sessionAgeMs: number
    }
  | {
      ok: false
      reason: "unauthorized" | "expired" | "forbidden"
    }

let cachedAdminClient: SupabaseClient | null = null
function getServiceClient(): SupabaseClient {
  if (!cachedAdminClient) {
    cachedAdminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return cachedAdminClient
}

/**
 * Validates that the current request is from an admin with a fresh session.
 *
 * Returns one of:
 *   { ok: true, user, sessionAgeMs }
 *   { ok: false, reason: "unauthorized" }   — no session
 *   { ok: false, reason: "expired" }        — session older than 8h
 *   { ok: false, reason: "forbidden" }      — session valid but profile.is_admin = false
 *
 * Callers decide whether to JSON-error or redirect.
 */
export async function checkAdmin(): Promise<AdminCheckResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.session) {
    return { ok: false, reason: "unauthorized" }
  }

  const createdAtRaw = (session.session as { createdAt?: string | Date }).createdAt
  const createdAt = createdAtRaw ? new Date(createdAtRaw).getTime() : Date.now()
  const sessionAgeMs = Date.now() - createdAt
  if (sessionAgeMs > ADMIN_SESSION_MAX_AGE_MS) {
    return { ok: false, reason: "expired" }
  }

  const { data: profile, error } = await getServiceClient()
    .from("profiles")
    .select("is_admin, email")
    .eq("id", session.user.id)
    .single()

  if (error || !profile?.is_admin) {
    return { ok: false, reason: "forbidden" }
  }

  return {
    ok: true,
    user: { id: session.user.id, email: profile.email },
    sessionAgeMs,
  }
}
