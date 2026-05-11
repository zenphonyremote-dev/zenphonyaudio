import { NextRequest, NextResponse } from "next/server"
import { checkAdmin } from "@/lib/admin-auth"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

// =====================================================================
// /api/admin/support/logs
//
// GET  — list recent support log uploads, joined with user email + plan.
// PATCH — update status / notes on a given log row.
// =====================================================================

export const dynamic = "force-dynamic"

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

let supabaseAdmin: SupabaseClient | null = null
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error("Missing Supabase configuration")
    supabaseAdmin = createClient(url, key)
  }
  return supabaseAdmin
}

export async function GET(request: NextRequest) {
  const check = await checkAdmin()
  if (!check.ok) {
    const status = check.reason === "forbidden" ? 403 : 401
    return NextResponse.json({ error: check.reason }, { status })
  }

  const { searchParams } = new URL(request.url)
  const limitRaw = parseInt(searchParams.get("limit") || "", 10)
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), MAX_LIMIT)
    : DEFAULT_LIMIT
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0)
  const statusFilter = searchParams.get("status") // 'uploaded' | 'reviewed' | 'archived' | null
  const emailFilter = searchParams.get("email")   // partial email match

  const supabase = getSupabaseAdmin()
  let q = supabase
    .from("support_logs")
    .select(
      "id, user_id, machine_id_hash, created_at, plugin_version, os_version, hardware_model, ram_gb, cpu_model, cpu_cores, eagle_state, host_app, host_format, log_size_bytes, log_path, log_summary, status, reviewed_at, reviewed_by, notes",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (statusFilter && ["uploaded", "reviewed", "archived"].includes(statusFilter)) {
    q = q.eq("status", statusFilter)
  }

  const { data: logs, error: logsErr, count } = await q
  if (logsErr) {
    console.error("[admin/support/logs] list error:", logsErr)
    return NextResponse.json({ error: "query_failed" }, { status: 500 })
  }

  // Hydrate user email/plan for each row in one query
  const userIds = Array.from(new Set((logs ?? []).map((l) => l.user_id)))
  let profilesByUserId = new Map<
    string,
    { email: string | null; full_name: string | null; subscription_plan: string | null }
  >()
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, subscription_plan")
      .in("id", userIds)
    for (const p of profiles ?? []) {
      profilesByUserId.set(p.id as string, {
        email: (p.email as string) ?? null,
        full_name: (p.full_name as string) ?? null,
        subscription_plan: (p.subscription_plan as string) ?? null,
      })
    }
  }

  const enriched = (logs ?? []).map((l) => {
    const p = profilesByUserId.get(l.user_id as string)
    return {
      ...l,
      user_email: p?.email ?? null,
      user_full_name: p?.full_name ?? null,
      user_plan: p?.subscription_plan ?? null,
    }
  })

  // Email filter applied in-memory (filter on the join result) since
  // a single SQL with ILIKE through a foreign key would need a view.
  const filtered = emailFilter
    ? enriched.filter((l) =>
        (l.user_email || "").toLowerCase().includes(emailFilter.toLowerCase()),
      )
    : enriched

  return NextResponse.json({
    logs: filtered,
    total: count ?? filtered.length,
    limit,
    offset,
  })
}

export async function PATCH(request: NextRequest) {
  const check = await checkAdmin()
  if (!check.ok) {
    const status = check.reason === "forbidden" ? 403 : 401
    return NextResponse.json({ error: check.reason }, { status })
  }

  let body: { id?: string; status?: string; notes?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (!body.id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.status) {
    if (!["uploaded", "reviewed", "archived"].includes(body.status)) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 })
    }
    updates.status = body.status
    if (body.status === "reviewed") {
      updates.reviewed_at = new Date().toISOString()
      updates.reviewed_by = check.user.id
    }
  }
  if (typeof body.notes === "string") {
    updates.notes = body.notes
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no_updates" }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("support_logs")
    .update(updates)
    .eq("id", body.id)

  if (error) {
    console.error("[admin/support/logs] patch error:", error)
    return NextResponse.json({ error: "update_failed" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
