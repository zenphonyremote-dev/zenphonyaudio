import { NextRequest, NextResponse } from "next/server"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { uploadSupportLog } from "@/lib/r2"

// =====================================================================
// /api/support/upload-log
//
// Plugin-facing support log upload. Plugin posts:
//   POST multipart/form-data
//     api_key         (string)
//     machine_id_hash (string, optional)
//     system_info     (JSON string)  — see SQL migration for shape
//     log_summary     (JSON string, optional) — aggregate counts
//     log             (file)         — gzipped JSONL, last 48h
//
// Flow:
//   1. Validate api_key, parse multipart
//   2. Upload gzipped log to R2 under support-logs/{user_id}/...
//   3. Insert support_logs row via record_support_log_upload RPC
//   4. Return { success, log_id }
//
// Hard size cap: 64 MB (gzipped). Anything larger is rejected.
// =====================================================================

const MAX_LOG_BYTES = 64 * 1024 * 1024

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

function safeJsonParse(s: string | null | undefined): unknown {
  if (!s) return null
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const apiKey = form.get("api_key")
    if (typeof apiKey !== "string" || !apiKey) {
      return json({ success: false, error: "missing_api_key" }, { status: 400 })
    }

    const machineIdHash = (form.get("machine_id_hash") as string) || null
    const systemInfoRaw = form.get("system_info")
    const logSummaryRaw = form.get("log_summary")
    const logFile = form.get("log")

    if (!(logFile instanceof Blob)) {
      return json({ success: false, error: "missing_log_file" }, { status: 400 })
    }
    if (logFile.size > MAX_LOG_BYTES) {
      return json(
        { success: false, error: "log_too_large", max_bytes: MAX_LOG_BYTES },
        { status: 413 },
      )
    }
    if (logFile.size === 0) {
      return json({ success: false, error: "empty_log_file" }, { status: 400 })
    }

    const systemInfo = safeJsonParse(
      typeof systemInfoRaw === "string" ? systemInfoRaw : null,
    )
    if (!systemInfo || typeof systemInfo !== "object") {
      return json(
        { success: false, error: "missing_or_invalid_system_info" },
        { status: 400 },
      )
    }
    const logSummary = safeJsonParse(
      typeof logSummaryRaw === "string" ? logSummaryRaw : null,
    )

    // Resolve user from api_key BEFORE upload, so we can scope the R2 path
    // and bail early on bad keys without burning R2 storage.
    const admin = getSupabaseAdmin()
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("id")
      .eq("api_key", apiKey)
      .maybeSingle()

    if (profileErr) {
      console.error("[support/upload-log] profile lookup:", profileErr)
      return json({ success: false, error: "auth_query_failed" }, { status: 500 })
    }
    if (!profile?.id) {
      return json({ success: false, error: "invalid_api_key" }, { status: 401 })
    }

    // Upload to R2
    const buf = Buffer.from(await logFile.arrayBuffer())
    let logPath: string
    try {
      logPath = await uploadSupportLog(profile.id, buf, {
        contentEncoding: "gzip",
        contentType: "application/x-ndjson",
        metadata: {
          plugin_version: String(
            (systemInfo as Record<string, unknown>).plugin_version ?? "",
          ),
          host_app: String((systemInfo as Record<string, unknown>).host_app ?? ""),
        },
      })
    } catch (err) {
      console.error("[support/upload-log] R2 upload:", err)
      return json({ success: false, error: "r2_upload_failed" }, { status: 502 })
    }

    // Insert support_logs row via RPC (uses api_key for last-mile auth in SQL too).
    const { data: rpcData, error: rpcErr } = await admin.rpc(
      "record_support_log_upload",
      {
        p_api_key: apiKey,
        p_machine_id_hash: machineIdHash,
        p_log_path: logPath,
        p_log_size_bytes: buf.byteLength,
        p_system_info: systemInfo,
        p_log_summary: logSummary,
      },
    )

    if (rpcErr) {
      console.error("[support/upload-log] RPC error:", rpcErr)
      return json(
        { success: false, error: "rpc_failed", detail: rpcErr.message },
        { status: 500 },
      )
    }

    const result = rpcData as {
      success: boolean
      log_id?: string
      log_path?: string
      error?: string
    }
    if (!result?.success) {
      return json(
        { success: false, error: result?.error || "insert_failed" },
        { status: 400 },
      )
    }

    return json({
      success: true,
      log_id: result.log_id,
      log_path: result.log_path,
    })
  } catch (err) {
    console.error("[support/upload-log] handler:", err)
    return json({ success: false, error: "internal_error" }, { status: 500 })
  }
}
