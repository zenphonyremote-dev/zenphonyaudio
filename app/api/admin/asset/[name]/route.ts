import { readFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"
import { checkAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const ALLOWED = new Set([
  "admin.jsx",
  "admin-helpers.jsx",
  "admin-personas.jsx",
  "admin-phase2.jsx",
  "admin-phase3.jsx",
  "admin-phase4.jsx",
  "admin-phase5.jsx",
  "admin-refunds.jsx",
  "admin-support.jsx",
  "admin-support-logs.jsx",
])

const ASSETS_DIR = path.join(process.cwd(), "lib", "admin-assets")

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const check = await checkAdmin()
  if (!check.ok) {
    const status = check.reason === "unauthorized" || check.reason === "expired" ? 401 : 403
    return NextResponse.json({ error: check.reason }, { status })
  }

  const { name } = await params
  if (!ALLOWED.has(name)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  let content: string
  try {
    content = await readFile(path.join(ASSETS_DIR, name), "utf8")
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
