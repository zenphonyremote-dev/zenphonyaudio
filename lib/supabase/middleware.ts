// Auth is now handled by Better Auth — this file is no longer used.
// Supabase client/server files are kept for data queries only.
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request })
}
