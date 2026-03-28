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
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min client-side cookie cache
    },
  },

  trustedOrigins: [
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3005",
  ],

  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
