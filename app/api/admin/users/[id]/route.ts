import { NextResponse } from "next/server"
import { checkAdmin } from "@/lib/admin-auth"
import { getServiceClient, profileToDTO, type ProfileRow } from "@/lib/admin-shapes"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await checkAdmin()
  if (!check.ok) {
    const status = check.reason === "forbidden" ? 403 : 401
    return NextResponse.json({ error: check.reason }, { status })
  }

  const { id } = await params
  const supabase = getServiceClient()

  const profileRes = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, subscription_plan, subscription_status, subscription_period, listening_minutes_used, listening_minutes_limit, topup_minutes, chat_tokens_used, chat_tokens_limit, stripe_customer_id, created_at, is_admin",
    )
    .eq("id", id)
    .single()

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const row = profileRes.data as ProfileRow & {
    listening_minutes_limit: number | null
    topup_minutes: number | null
    chat_tokens_used: number | null
    chat_tokens_limit: number | null
  }
  const dto = profileToDTO(row)

  const thirtyDaysAgoDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const [billingRes, dailyRes] = await Promise.all([
    supabase
      .from("billing_events")
      .select("event_type, amount_cents, plan_to, created_at, description, stripe_event_id")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("usage_daily_snapshots")
      .select("date, minutes_used")
      .eq("user_id", id)
      .gte("date", thirtyDaysAgoDate)
      .order("date", { ascending: true }),
  ])

  return NextResponse.json({
    user: dto,
    invoices: billingRes.data ?? [],
    usage: {
      minutes_used: row.listening_minutes_used ?? 0,
      minutes_limit: row.listening_minutes_limit ?? 0,
      topup_minutes: row.topup_minutes ?? 0,
      chat_tokens_used: row.chat_tokens_used ?? 0,
      chat_tokens_limit: row.chat_tokens_limit ?? 50000,
      daily: dailyRes.data ?? [],
    },
  })
}
