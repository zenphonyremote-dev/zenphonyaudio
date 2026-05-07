import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-helpers"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  const { user } = await getAuthUser()
  if (!user) {
    return NextResponse.json({ isAdmin: false }, { status: 401 })
  }

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin, email")
    .eq("id", user.id)
    .single()

  if (error || !data || !data.is_admin) {
    return NextResponse.json({ isAdmin: false }, { status: 403 })
  }

  return NextResponse.json({ isAdmin: true, email: data.email })
}
