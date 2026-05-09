import { NextRequest, NextResponse } from "next/server"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

// CORS headers — matches the rest of /api/plugin/* (called from plugin
// WebView and from the Software Hub Tauri app, both cross-origin).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

function json(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, { ...init, headers: corsHeaders })
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

let supabaseAdmin: SupabaseClient | null = null
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error("Missing Supabase configuration")
    }
    supabaseAdmin = createClient(url, key)
  }
  return supabaseAdmin
}

type RegisterBody = {
  api_key?: string
  machine_id_hash?: string
  hostname?: string
  app_version?: string
  source?: "plugin" | "hub"
}

export async function POST(request: NextRequest) {
  try {
    let body: RegisterBody
    try {
      body = (await request.json()) as RegisterBody
    } catch {
      return json({ success: false, error: "invalid_json" }, { status: 400 })
    }

    const { api_key, machine_id_hash, hostname, app_version, source } = body

    if (!api_key || typeof api_key !== "string") {
      return json(
        { success: false, error: "missing_api_key" },
        { status: 400 }
      )
    }
    if (!machine_id_hash || typeof machine_id_hash !== "string") {
      return json(
        { success: false, error: "missing_machine_id_hash" },
        { status: 400 }
      )
    }

    const sourceValue: "plugin" | "hub" =
      source === "plugin" || source === "hub" ? source : "hub"

    const admin = getSupabaseAdmin()
    const { data, error } = await admin.rpc("register_machine_via_api_key", {
      p_api_key: api_key,
      p_machine_id_hash: machine_id_hash,
      p_hostname: hostname ?? null,
      p_app_version: app_version ?? null,
      p_source: sourceValue,
    })

    if (error) {
      console.error("[plugin/machines/register] RPC error:", error)
      return json(
        { success: false, error: "rpc_failed", detail: error.message },
        { status: 500 }
      )
    }

    // RPC returns JSON: { success, registered, already_active, machine_count, machine_limit, error? }
    const result = (data ?? {}) as {
      success?: boolean
      error?: string
    }

    if (result.error === "invalid_api_key") {
      return json(result, { status: 401 })
    }
    if (result.error === "machine_limit_reached") {
      return json(result, { status: 409 })
    }
    if (result.error === "missing_required_param") {
      return json(result, { status: 400 })
    }

    return json(result, { status: 200 })
  } catch (err) {
    console.error("[plugin/machines/register] Unexpected error:", err)
    return json(
      { success: false, error: "internal_error" },
      { status: 500 }
    )
  }
}
