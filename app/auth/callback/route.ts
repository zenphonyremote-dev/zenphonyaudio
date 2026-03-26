import { NextResponse } from "next/server"

// Better Auth handles OAuth callbacks via /api/auth/[...all].
// This route is kept as a fallback redirect.
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/profile`)
}
