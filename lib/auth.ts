import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { Pool } from "pg"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Direct connection to Supabase PostgreSQL — pooler breaks pg prepared statements
const finalDbUrl = process.env.DATABASE_DIRECT_URL
console.log("[Better Auth] DB connection:", finalDbUrl ? "DATABASE_DIRECT_URL set" : "MISSING!", "host:", finalDbUrl?.split("@")[1]?.split("/")[0] || "unknown")

export const auth = betterAuth({
  database: new Pool({
    connectionString: finalDbUrl,
    ssl: { rejectUnauthorized: false },
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false, // TODO: re-enable once Resend domain is verified

    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "Zenphony Audio <onboarding@resend.dev>",
        to: user.email,
        subject: "Verify your email - Zenphony Audio",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #fff; margin-bottom: 8px;">Welcome to Zenphony Audio</h2>
            <p style="color: #aaa; margin-bottom: 24px;">Click the button below to verify your email address.</p>
            <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #c026d3); color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600;">
              Verify Email
            </a>
            <p style="color: #666; font-size: 12px; margin-top: 32px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        `,
      })
    },

    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "Zenphony Audio <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset your password - Zenphony Audio",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #fff; margin-bottom: 8px;">Reset your password</h2>
            <p style="color: #aaa; margin-bottom: 24px;">Click the button below to set a new password for your account.</p>
            <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #c026d3); color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 12px; margin-top: 32px;">If you didn't request this, you can safely ignore this email. The link expires in 1 hour.</p>
          </div>
        `,
      })
    },
  },

  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh when < 1 day remains
    // 2026-05-14: was cookieCache.enabled=true, maxAge=300s. Caused the
    // "can't access admin without restarting Chrome" bug — Better Auth
    // stored session state in a 5-min HttpOnly cookie, so any state drift
    // between the cached cookie and the DB session (e.g. tab idle > 5 min,
    // login from another device, session refresh mid-flight) made the
    // server return stale "no session" responses that Chrome held onto
    // until the cookie was flushed. Disabling forces a DB read on every
    // auth check — sub-ms overhead on Supabase's pool, eliminates the
    // stale-cache bug class entirely. Re-enable with a tighter maxAge
    // (≤ 30s) only if profile-page latency becomes a measurable problem
    // under load.
    cookieCache: {
      enabled: false,
    },
  },

  // Rate limit auth endpoints to slow brute-force / credential stuffing.
  // Memory backend is fine for a single-region Vercel deploy. If we later
  // scale to multiple regions, swap to a distributed backend.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 300, max: 3 },
      "/forget-password": { window: 600, max: 3 },
      "/reset-password": { window: 600, max: 3 },
    },
  },

  // 2026-05-16: zenphonyaudio.com is the canonical production domain.
  // zenphonyaudio.vercel.app is still alive as the Vercel preview URL and we
  // keep it trusted so existing logged-in sessions there don't break overnight.
  // localhost:3005 is for local dev. The dedupe filter avoids double-listing
  // if NEXT_PUBLIC_BASE_URL == one of the static entries.
  trustedOrigins: [
    "https://zenphonyaudio.com",
    "https://www.zenphonyaudio.com",
    "https://zenphonyaudio.vercel.app",
    process.env.NEXT_PUBLIC_BASE_URL || "",
    "http://localhost:3005",
  ].filter((v, i, a) => v && a.indexOf(v) === i),

  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
