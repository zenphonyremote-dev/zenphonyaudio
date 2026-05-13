import { NextResponse } from "next/server"
import { checkAdmin } from "@/lib/admin-auth"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { fetchSupportLogBytes } from "@/lib/r2"
import { gunzipSync } from "node:zlib"

// =====================================================================
// /api/admin/support/logs/[id]/download
//
// Admin-only. Streams the support log to the browser as a .json file.
//
// Previously this returned a signed R2 GET URL with Content-Encoding=gzip,
// and the admin frontend redirected the browser to it. Problem: some
// uploads land in R2 with bytes that aren't actually gzip-formatted
// despite the upload route setting ContentEncoding=gzip on the PutObject.
// (Most likely a plugin-side encoding bug — JUCE's base64 boundary or a
// pre-shipped build that does something extra before gzipping.) Chrome's
// download decompressor aborts on those with "Failed - Network error",
// and the admin can't get the log.
//
// New approach: pull the bytes server-side, detect-and-decompress if the
// magic is gzip (1f 8b) or fall back to raw passthrough for malformed
// uploads, then stream the result as application/json with a download
// disposition. Robust against any upload pipeline weirdness.
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

  let raw: Buffer
  try {
    raw = await fetchSupportLogBytes(log.log_path as string)
  } catch (err) {
    console.error("[admin/support/logs/download] r2 fetch:", err)
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 })
  }

  // Detect gzip magic (1f 8b). If present, decompress. Otherwise return as-is.
  // We intentionally don't `throw` on a malformed gzip: we want the admin to
  // be able to download SOMETHING (even raw bytes) for forensics on broken
  // uploads. The malformed-bytes case will land as a .json with whatever
  // was stored — admin can inspect manually.
  let body: Buffer = raw
  let kind = "unknown"
  if (raw.length >= 2 && raw[0] === 0x1f && raw[1] === 0x8b) {
    try {
      body = gunzipSync(raw)
      kind = "gzip"
    } catch (err) {
      console.warn(
        "[admin/support/logs/download] gzip magic present but decompress failed; passing through raw:",
        (err as Error).message,
      )
      body = raw
      kind = "gzip-malformed"
    }
  } else {
    kind = "non-gzip"
  }

  // Build the filename from the R2 key's basename, with .gz stripped and .json
  // forced. Chrome treats `.json` as a universally-trusted extension and will
  // download without Safe Browsing interference.
  const sourceName = (log.log_path as string).split("/").pop() ?? "log"
  const baseName = sourceName.replace(/\.jsonl?\.gz$/i, "").replace(/\.gz$/i, "")
  const filename = (baseName.endsWith(".json") ? baseName : baseName + ".json").replace(/"/g, "")

  console.log(
    `[admin/support/logs/download] served id=${id} key=${log.log_path} kind=${kind} bytes=${body.length}`,
  )

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(body.length),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-LB-Stored-Kind": kind,
    },
  })
}
