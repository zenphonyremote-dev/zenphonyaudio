import { NextResponse } from "next/server"
import { checkAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const check = await checkAdmin()
  if (!check.ok) {
    const status =
      check.reason === "unauthorized" || check.reason === "expired" ? 401 : 403
    return NextResponse.json(
      { isAdmin: false, reason: check.reason },
      { status },
    )
  }
  return NextResponse.json({ isAdmin: true, email: check.user.email })
}
