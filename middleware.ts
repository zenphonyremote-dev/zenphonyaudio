import { type NextRequest, NextResponse } from "next/server"

const publicRoutes = ["/", "/login", "/signup", "/signup/success", "/forgot-password", "/reset-password", "/pricing", "/products", "/products/listen-buddy", "/about", "/contact", "/solutions"]
const authRoutes = ["/login", "/signup"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files and API routes (Better Auth handles its own)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check for Better Auth session cookie (lightweight, no DB call)
  // Try both possible cookie names
  const sessionToken = request.cookies.get("better-auth.session_token")?.value
    || request.cookies.get("__Secure-better-auth.session_token")?.value
    || request.cookies.get("better-auth.session")?.value
    || request.cookies.get("__Secure-better-auth.session")?.value

  // Debug: log all cookie names to find the right one
  const cookieNames = request.cookies.getAll().map(c => c.name).join(", ")
  if (pathname === "/profile") {
    console.log("[Middleware] /profile cookies:", cookieNames, "| session found:", !!sessionToken)
  }

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  )
  const isAuthRoute = authRoutes.includes(pathname)

  // Redirect authenticated users away from login/signup
  if (sessionToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/profile", request.url))
  }

  // Redirect unauthenticated users to login (only for protected routes)
  if (!sessionToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
