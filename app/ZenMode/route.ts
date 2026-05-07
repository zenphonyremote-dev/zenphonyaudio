import { readFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"
import { checkAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const check = await checkAdmin()
  if (!check.ok) {
    const url = new URL("/account", request.url)
    if (check.reason === "expired") url.searchParams.set("reauth", "1")
    return NextResponse.redirect(url, { status: 302 })
  }

  const html = await readFile(
    path.join(process.cwd(), "lib", "admin-shell.html"),
    "utf8",
  )

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  })
}
