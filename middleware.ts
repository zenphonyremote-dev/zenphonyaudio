import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const publicRoutes = ["/", "/login", "/signup", "/signup/success", "/forgot-password", "/reset-password", "/pricing", "/products", "/products/listen-buddy"]
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

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  )
  const isAuthRoute = authRoutes.includes(pathname)

  // Redirect authenticated users away from login/signup
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/profile", request.url))
  }

  // Redirect unauthenticated users to login (only for protected routes)
  if (!session && !isPublicRoute) {
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
