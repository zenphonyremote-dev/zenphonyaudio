import { NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { checkAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const PLAN_PRICE_USD: Record<string, number> = {
  free: 0,
  basic: 7.99,
  pro: 29.99,
  max: 69.99,
}

export async function GET() {
  const check = await checkAdmin()
  if (!check.ok) {
    const status =
      check.reason === "unauthorized" || check.reason === "expired" ? 401 : 403
    return NextResponse.json({ error: check.reason }, { status })
  }

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgoDate = thirtyDaysAgo.toISOString().slice(0, 10)

  const [plansRes, signupsRes, snapshotRes, billingRes] = await Promise.all([
    supabase.from("profiles").select("subscription_plan, subscription_status"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("usage_daily_snapshots")
      .select("minutes_used")
      .gte("date", thirtyDaysAgoDate),
    supabase
      .from("billing_events")
      .select("event_type, amount_cents, plan_to, created_at, description")
      .order("created_at", { ascending: false })
      .limit(8),
  ])

  const plans = plansRes.data ?? []
  const total_users = plans.length
  let active_subscribers = 0
  let mrr_cents = 0
  const by_plan: Record<string, number> = { free: 0, basic: 0, pro: 0, max: 0 }
  for (const p of plans) {
    const plan = p.subscription_plan ?? "free"
    if (plan in by_plan) by_plan[plan]++
    if (p.subscription_status === "active" && plan !== "free") {
      active_subscribers++
      mrr_cents += Math.round((PLAN_PRICE_USD[plan] ?? 0) * 100)
    }
  }

  const minutes_30d = (snapshotRes.data ?? []).reduce(
    (s, r) => s + (Number((r as { minutes_used?: unknown }).minutes_used) || 0),
    0,
  )

  return NextResponse.json({
    total_users,
    active_subscribers,
    mrr_cents,
    by_plan,
    signups_7d: signupsRes.count ?? 0,
    minutes_30d: Math.round(minutes_30d),
    billing_events: billingRes.data ?? [],
  })
}
