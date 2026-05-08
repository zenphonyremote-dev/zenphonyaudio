import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-helpers"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!

function service() {
  return createAdminClient(SUPABASE_URL, SERVICE_ROLE)
}

const TEXT_LIMITS = {
  full_name: 80,
  handle: 32,
  bio: 280,
  company: 80,
  timezone: 64,
} as const

function isValidTimezone(tz: string): boolean {
  if (!tz) return true // empty allowed (clears the field)
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz })
    return true
  } catch {
    return false
  }
}

const HANDLE_RE = /^@?[a-zA-Z0-9_-]{2,32}$/

export async function GET() {
  const { user } = await getAuthUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { data, error } = await service()
    .from("profiles")
    .select("id, email, full_name, handle, bio, company, timezone, avatar_url")
    .eq("id", user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  return NextResponse.json({ profile: data })
}

export async function PATCH(request: Request) {
  const { user } = await getAuthUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const update: Record<string, string | null> = {}

  for (const [key, raw] of Object.entries(body)) {
    if (!(key in TEXT_LIMITS)) continue // ignore unknown fields
    if (raw === null || raw === undefined || raw === "") {
      update[key] = null
      continue
    }
    if (typeof raw !== "string") {
      return NextResponse.json({ error: `invalid_${key}` }, { status: 400 })
    }
    let v = raw.trim()
    if (key === "handle") {
      if (!HANDLE_RE.test(v)) {
        return NextResponse.json(
          { error: "handle must be 2-32 chars, letters/numbers/_/- only" },
          { status: 400 },
        )
      }
      if (v.startsWith("@")) v = v.slice(1)
    }
    const limit = TEXT_LIMITS[key as keyof typeof TEXT_LIMITS]
    if (v.length > limit) {
      return NextResponse.json(
        { error: `${key}_too_long`, max: limit },
        { status: 400 },
      )
    }
    if (key === "timezone" && !isValidTimezone(v)) {
      return NextResponse.json({ error: "invalid_timezone" }, { status: 400 })
    }
    update[key] = v
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 })
  }

  const { data, error } = await service()
    .from("profiles")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("id, email, full_name, handle, bio, company, timezone, avatar_url")
    .single()

  if (error) {
    if (error.code === "23505") {
      // unique violation on handle
      return NextResponse.json({ error: "handle_taken" }, { status: 409 })
    }
    console.error("[profile PATCH]", error)
    return NextResponse.json({ error: "update_failed" }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
