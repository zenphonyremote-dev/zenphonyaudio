import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createClient as createAdminClient } from "@supabase/supabase-js"

// Direct login endpoint for the Listen Buddy plugin
// Accepts email+password, returns user profile + subscription + api_key
// No browser redirect needed — plugin calls this directly from its WebView
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Authenticate with Better Auth
    const result = await auth.api.signInEmail({
      body: { email, password },
    })

    if (!result?.user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const userId = result.user.id

    // Fetch profile from Supabase
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    // Generate API key if missing
    if (!profile.api_key) {
      const apiKey = `lb_${Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`
      await supabaseAdmin
        .from("profiles")
        .update({ api_key: apiKey })
        .eq("id", userId)
      profile.api_key = apiKey
    }

    // Calculate minutes
    const subscriptionLimit = profile.listening_minutes_limit || 5
    const subscriptionUsed = profile.listening_minutes_used || 0
    const topupMinutes = profile.topup_minutes || 0
    const subscriptionRemaining = Math.max(0, subscriptionLimit - subscriptionUsed)
    const cloudLimit = Math.ceil(subscriptionLimit / 2)
    const cloudRemaining = Math.max(0, cloudLimit - subscriptionUsed)

    const response = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        company: profile.company,
        job_title: profile.job_title,
        created_at: profile.created_at,
      },
      subscription: {
        plan: profile.subscription_plan || "free",
        status: profile.subscription_status || "active",
        period: profile.subscription_period,
      },
      minutes: {
        subscription_limit: subscriptionLimit,
        subscription_used: subscriptionUsed,
        subscription_remaining: subscriptionRemaining,
        topup_balance: topupMinutes,
        total_available: subscriptionRemaining + topupMinutes,
        cloud_limit: cloudLimit,
        cloud_remaining: cloudRemaining,
        cloud_available: Math.max(0, cloudRemaining + topupMinutes),
      },
      api_key: profile.api_key,
    })
    response.headers.set("Access-Control-Allow-Origin", "*")
    return response
  } catch (error: any) {
    console.error("[direct-login] Error:", error)
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    )
  }
}

// Enable CORS for plugin WebView
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
