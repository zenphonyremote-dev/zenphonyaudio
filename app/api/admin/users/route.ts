import { NextResponse } from "next/server"
import { checkAdmin } from "@/lib/admin-auth"
import { getServiceClient, profileToDTO, type ProfileRow } from "@/lib/admin-shapes"

export const dynamic = "force-dynamic"

export async function GET() {
  const check = await checkAdmin()
  if (!check.ok) {
    const status = check.reason === "forbidden" ? 403 : 401
    return NextResponse.json({ error: check.reason }, { status })
  }

  const supabase = getServiceClient()
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString()

  const [profilesRes, paidEventsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, email, full_name, subscription_plan, subscription_status, subscription_period, listening_minutes_used, stripe_customer_id, created_at, is_admin",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("billing_events")
      .select("user_id", { count: "exact", head: true })
      .eq("event_type", "subscription_created")
      .gte("created_at", thirtyDaysAgo),
  ])

  const rows = (profilesRes.data ?? []) as ProfileRow[]
  const users = rows.map(profileToDTO)
  const total = users.length
  const paying = users.filter(
    (u) => u.plan !== "free" && u.state === "active",
  ).length
  const paid_this_month = paidEventsRes.count ?? 0

  return NextResponse.json({ users, total, paying, paid_this_month })
}
