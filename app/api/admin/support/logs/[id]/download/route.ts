import { NextResponse } from "next/server"
import { checkAdmin } from "@/lib/admin-auth"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { signedDownloadUrl } from "@/lib/r2"

// =====================================================================
// /api/admin/support/logs/[id]/download
//
// Admin-only. Returns a 5-minute signed R2 GET URL for the log file.
// The admin frontend hits this and immediately redirects the browser
// to the URL, which streams the .jsonl.gz file directly from R2.
// =====================================================================

export const dynamic = "force-dynamic"

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
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: log, error } = await supabase
    .from("support_logs")
    .select("log_path")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[admin/support/logs/download] query:", error)
    return NextResponse.json({ error: "query_failed" }, { status: 500 })
  }
  if (!log?.log_path) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  let url: string
  try {
    url = await signedDownloadUrl(log.log_path as string, 5 * 60)
  } catch (err) {
    console.error("[admin/support/logs/download] sign:", err)
    return NextResponse.json({ error: "sign_failed" }, { status: 502 })
  }

  return NextResponse.json({ url, expires_in: 5 * 60 })
}
