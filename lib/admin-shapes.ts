import { createClient as createAdminClient, SupabaseClient } from "@supabase/supabase-js"

export const PLAN_PRICE_CENTS: Record<string, number> = {
  free: 0,
  basic: 799,
  pro: 2999,
  max: 6999,
}

export type AdminUserDTO = {
  id: string
  name: string
  email: string
  plan: string
  state: string
  period: string | null
  mrr: number
  ltv: number
  since: string
  sessions: number
  avatar: string
  cls: string
  is_admin: boolean
  stripe_customer_id: string | null
}

export type ProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  subscription_plan: string | null
  subscription_status: string | null
  subscription_period: string | null
  listening_minutes_used: number | null
  stripe_customer_id: string | null
  created_at: string | null
  is_admin: boolean | null
}

const COLOR_CLASSES = ["", "alt-1", "alt-2", "alt-3", "alt-4"]

export function profileToDTO(p: ProfileRow): AdminUserDTO {
  const fallbackEmail = p.email ?? ""
  const name =
    (p.full_name && p.full_name.trim()) ||
    fallbackEmail.split("@")[0] ||
    "Unknown"
  const initials =
    name
      .split(/\s+/)
      .map((s) => s[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"

  const since = p.created_at ? p.created_at.slice(0, 10) : ""
  const monthsAgo = since
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(since).getTime()) /
            (1000 * 60 * 60 * 24 * 30),
        ),
      )
    : 1

  const plan = p.subscription_plan || "free"
  const status = p.subscription_status || "active"
  const isPaidActive = plan !== "free" && status === "active"
  const mrrCents = isPaidActive ? PLAN_PRICE_CENTS[plan] ?? 0 : 0
  const mrr = mrrCents / 100
  const ltv = Math.round(mrr * monthsAgo)
  const state = plan === "free" ? "free" : status

  const colorSeed = (p.email || p.id || "").split("").reduce(
    (a, c) => a + c.charCodeAt(0),
    0,
  )
  const cls = COLOR_CLASSES[colorSeed % COLOR_CLASSES.length]

  return {
    id: p.id,
    name,
    email: p.email ?? "",
    plan,
    state,
    period: p.subscription_period ?? null,
    mrr,
    ltv,
    since,
    sessions: p.listening_minutes_used ?? 0,
    avatar: initials,
    cls,
    is_admin: !!p.is_admin,
    stripe_customer_id: p.stripe_customer_id ?? null,
  }
}

let cachedAdminClient: SupabaseClient | null = null
export function getServiceClient(): SupabaseClient {
  if (!cachedAdminClient) {
    cachedAdminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return cachedAdminClient
}
