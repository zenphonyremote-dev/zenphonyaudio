import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get("better-auth.session_token")?.value
    || request.cookies.get("__Secure-better-auth.session_token")?.value
    || request.cookies.get("better-auth.session")?.value
    || request.cookies.get("__Secure-better-auth.session")?.value

  // Defensive gate on /ZenMode so anonymous visitors don't see the admin shell flash.
  // app/api/admin/check-access does the real is_admin enforcement.
  if (pathname === "/ZenMode" && !sessionToken) {
    return NextResponse.redirect(new URL("/account", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
