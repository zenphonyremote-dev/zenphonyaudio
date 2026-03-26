import { auth } from "@/lib/auth"
import { headers } from "next/headers"

/**
 * Get the current authenticated user from Better Auth session.
 * Use this in API routes instead of supabase.auth.getUser().
 */
export async function getAuthUser() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session?.user) {
    return { user: null, error: new Error("Unauthorized") }
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
    },
    error: null,
  }
}
