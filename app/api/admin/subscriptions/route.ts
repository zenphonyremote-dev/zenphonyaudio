import { NextResponse } from "next/server"
import { checkAdmin } from "@/lib/admin-auth"
import {
  getServiceClient,
  profileToDTO,
  PLAN_PRICE_CENTS,
  type ProfileRow,
  type AdminUserDTO,
} from "@/lib/admin-shapes"

export const dynamic = "force-dynamic"

const PREVIEW_PER_STATE = 8

const STATE_KEYS = ["active", "trialing", "past_due", "paused", "cancelled"] as const
type StateKey = (typeof STATE_KEYS)[number]

export async function GET() {
  const check = await checkAdmin()
  if (!check.ok) {
    const status = check.reason === "forbidden" ? 403 : 401
    return NextResponse.json({ error: check.reason }, { status })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, subscription_plan, subscription_status, subscription_period, listening_minutes_used, stripe_customer_id, created_at, is_admin",
    )
    .neq("subscription_plan", "free")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "query_failed" }, { status: 500 })
  }

  const rows = (data ?? []) as ProfileRow[]
  const states: Record<StateKey, { count: number; mrr_cents: number }> = {
    active: { count: 0, mrr_cents: 0 },
    trialing: { count: 0, mrr_cents: 0 },
    past_due: { count: 0, mrr_cents: 0 },
    paused: { count: 0, mrr_cents: 0 },
    cancelled: { count: 0, mrr_cents: 0 },
  }
  const preview: Record<StateKey, AdminUserDTO[]> = {
    active: [],
    trialing: [],
    past_due: [],
    paused: [],
    cancelled: [],
  }

  for (const row of rows) {
    const status = (row.subscription_status || "active") as StateKey
    if (!(status in states)) continue
    states[status].count++
    if (status === "active") {
      states[status].mrr_cents +=
        PLAN_PRICE_CENTS[row.subscription_plan || "free"] ?? 0
    }
    if (preview[status].length < PREVIEW_PER_STATE) {
      preview[status].push(profileToDTO(row))
    }
  }

  return NextResponse.json({ states, preview })
}
