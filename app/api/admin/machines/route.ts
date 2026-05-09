import { NextResponse } from "next/server"
import { checkAdmin } from "@/lib/admin-auth"
import { getServiceClient } from "@/lib/admin-shapes"

export const dynamic = "force-dynamic"

// Admin-only: list ALL active machine activations across all users.
// The user-facing version lives at /api/plugin/machines/list (per-user via
// api_key). This route is intended for the /ZenMode admin shell. The shell's
// HTML/JS still needs a "Machines" tab wired in to actually surface it.
export async function GET() {
  const check = await checkAdmin()
  if (!check.ok) {
    const status = check.reason === "forbidden" ? 403 : 401
    return NextResponse.json({ error: check.reason }, { status })
  }

  const supabase = getServiceClient()

  // Pull active machines + join the owner's email/plan/full_name for context.
  const { data, error } = await supabase
    .from("activated_machines")
    .select(
      `id, machine_id_hash, hostname, app_version, source, registered_at, last_seen_at,
       user_id,
       profiles:user_id ( email, full_name, subscription_plan )`
    )
    .is("revoked_at", null)
    .order("last_seen_at", { ascending: false })
    .limit(500)

  if (error) {
    console.error("[admin/machines] query failed:", error)
    return NextResponse.json({ error: "query_failed" }, { status: 500 })
  }

  type Row = {
    id: string
    machine_id_hash: string
    hostname: string | null
    app_version: string | null
    source: "plugin" | "hub"
    registered_at: string
    last_seen_at: string
    user_id: string
    profiles:
      | {
          email: string | null
          full_name: string | null
          subscription_plan: string | null
        }
      | {
          email: string | null
          full_name: string | null
          subscription_plan: string | null
        }[]
      | null
  }

  const rows = (data ?? []) as Row[]
  const machines = rows.map((r) => {
    // Supabase joins return either the related row or array-of-row depending
    // on the cardinality inference. Normalize to the single record case.
    const owner = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    return {
      id: r.id,
      machine_id_hash: r.machine_id_hash,
      hostname: r.hostname,
      app_version: r.app_version,
      source: r.source,
      registered_at: r.registered_at,
      last_seen_at: r.last_seen_at,
      user_id: r.user_id,
      user_email: owner?.email ?? null,
      user_full_name: owner?.full_name ?? null,
      user_plan: owner?.subscription_plan ?? null,
    }
  })

  // Lightweight aggregates for the admin shell to render header counts.
  const total = machines.length
  const by_source = {
    hub: machines.filter((m) => m.source === "hub").length,
    plugin: machines.filter((m) => m.source === "plugin").length,
  }
  const unique_users = new Set(machines.map((m) => m.user_id)).size

  return NextResponse.json({ machines, total, by_source, unique_users })
}
