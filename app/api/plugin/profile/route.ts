import { NextRequest, NextResponse } from "next/server"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

// CORS headers for cross-origin requests from the plugin WebView
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

function json(body: any, init?: { status?: number }) {
  return NextResponse.json(body, { ...init, headers: corsHeaders })
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// Lazy initialization of admin client
let supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error("Missing Supabase configuration")
    }

    supabaseAdmin = createClient(url, key)
  }
  return supabaseAdmin
}

export async function GET(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return json(
        { error: "Missing or invalid Authorization header. Use: Bearer lb_your_api_key" },
        { status: 401 }
      )
    }

    const apiKey = authHeader.replace("Bearer ", "").trim()

    // Validate API key format
    if (!apiKey.startsWith("lb_") || apiKey.length !== 35) {
      return json(
        { error: "Invalid API key format" },
        { status: 401 }
      )
    }

    const admin = getSupabaseAdmin()

    // Look up user by API key
    const { data: profile, error } = await admin
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        subscription_plan,
        subscription_status,
        subscription_period,
        listening_minutes_used,
        listening_minutes_limit,
        topup_minutes,
        chat_tokens_used,
        chat_tokens_limit,
        chat_tokens_reset_at
      `)
      .eq("api_key", apiKey)
      .single()

    if (error || !profile) {
      return json(
        { error: "Invalid API key" },
        { status: 401 }
      )
    }

    // Calculate total available minutes
    const subscriptionLimit = profile.listening_minutes_limit || 0
    const subscriptionUsed = profile.listening_minutes_used || 0
    const subscriptionMinutesRemaining = Math.max(0, subscriptionLimit - subscriptionUsed)
    const topupBalance = profile.topup_minutes || 0
    const totalMinutesAvailable = subscriptionMinutesRemaining + topupBalance

    // Cloud engines (Velvet/Verde) are cut off at half the total pool
    const cloudLimit = Math.floor(subscriptionLimit / 2)
    const cloudRemaining = Math.max(0, cloudLimit - subscriptionUsed)
    const cloudAvailable = cloudRemaining + topupBalance

    // Return user profile for DAW plugin
    return json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        avatar_url: profile.avatar_url,
      },
      subscription: {
        plan: profile.subscription_plan,
        status: profile.subscription_status,
        period: profile.subscription_period,
      },
      minutes: {
        subscription_limit: subscriptionLimit,
        subscription_used: subscriptionUsed,
        subscription_remaining: subscriptionMinutesRemaining,
        topup_balance: topupBalance,
        total_available: totalMinutesAvailable,
        cloud_limit: cloudLimit,
        cloud_remaining: cloudRemaining,
        cloud_available: cloudAvailable,
      },
      chat_tokens: {
        used: profile.chat_tokens_used || 0,
        limit: profile.chat_tokens_limit ?? 50000,
        remaining: (profile.chat_tokens_limit ?? 50000) === -1
          ? -1
          : Math.max(0, (profile.chat_tokens_limit ?? 50000) - (profile.chat_tokens_used || 0)),
        reset_at: profile.chat_tokens_reset_at,
      },
    })
  } catch (error) {
    console.error("Plugin profile API error:", error)
    return json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST endpoint to deduct minutes (called when plugin uses analysis)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      )
    }

    const apiKey = authHeader.replace("Bearer ", "").trim()

    if (!apiKey.startsWith("lb_") || apiKey.length !== 35) {
      return json(
        { error: "Invalid API key format" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { minutes_used } = body

    if (typeof minutes_used !== "number" || minutes_used <= 0) {
      return json(
        { error: "Invalid minutes_used value" },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()

    // Look up user by API key
    const { data: profile, error: lookupError } = await admin
      .from("profiles")
      .select("*")
      .eq("api_key", apiKey)
      .single()

    if (lookupError || !profile) {
      return json(
        { error: "Invalid API key" },
        { status: 401 }
      )
    }

    // Calculate available minutes
    const subscriptionMinutesRemaining = Math.max(
      0,
      (profile.listening_minutes_limit || 0) - (profile.listening_minutes_used || 0)
    )
    const topupMinutes = profile.topup_minutes || 0
    const totalAvailable = subscriptionMinutesRemaining + topupMinutes

    if (minutes_used > totalAvailable) {
      return json(
        {
          error: "Insufficient minutes",
          available: totalAvailable,
          requested: minutes_used
        },
        { status: 402 }
      )
    }

    // Deduct minutes: first from subscription, then from top-up
    let newSubscriptionUsed = profile.listening_minutes_used || 0
    let newTopupMinutes = topupMinutes
    let minutesToDeduct = minutes_used

    // Deduct from subscription first
    if (subscriptionMinutesRemaining > 0) {
      const deductFromSubscription = Math.min(minutesToDeduct, subscriptionMinutesRemaining)
      newSubscriptionUsed += deductFromSubscription
      minutesToDeduct -= deductFromSubscription
    }

    // Deduct remaining from top-up
    if (minutesToDeduct > 0) {
      newTopupMinutes -= minutesToDeduct
    }

    // Update profile
    const { error: updateError } = await admin
      .from("profiles")
      .update({
        listening_minutes_used: newSubscriptionUsed,
        topup_minutes: newTopupMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)

    if (updateError) {
      console.error("Failed to update minutes:", updateError)
      return json(
        { error: "Failed to update minutes" },
        { status: 500 }
      )
    }

    // Return updated balance
    const newSubscriptionRemaining = Math.max(
      0,
      (profile.listening_minutes_limit || 0) - newSubscriptionUsed
    )

    return json({
      success: true,
      minutes_deducted: minutes_used,
      minutes: {
        subscription_remaining: newSubscriptionRemaining,
        topup_balance: newTopupMinutes,
        total_available: newSubscriptionRemaining + newTopupMinutes,
      },
    })
  } catch (error) {
    console.error("Plugin minutes deduction error:", error)
    return json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
