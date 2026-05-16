import { createAuthClient } from "better-auth/react"

// 2026-05-16: production canonical is zenphonyaudio.com. Fallback chain:
//   1. NEXT_PUBLIC_BASE_URL (set on Vercel — should be the canonical domain)
//   2. window.location.origin in the browser — always calls back to the same
//      host the page was served from, which avoids cross-origin cookie issues
//      regardless of which alias (zenphonyaudio.com vs vercel.app) the user
//      landed on.
//   3. localhost:3005 for SSR/build-time fallback (Next.js evaluates this in
//      a Node context where window doesn't exist).
const baseURL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3005")

export const authClient = createAuthClient({ baseURL })

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient
