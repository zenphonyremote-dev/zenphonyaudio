import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// This endpoint verifies a checkout session and updates the user's profile
// Used as a fallback when webhooks can't reach localhost
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const email = session.customer_email || session.customer_details?.email
    const metadata = session.metadata || {}
    const type = metadata.type // 'subscription' or 'topup'

    if (!email) {
      return NextResponse.json({ error: 'No email found in session' }, { status: 400 })
    }

    // Find user by email in Better Auth user table.
    // Use ilike for case-insensitive match (Stripe sometimes returns
    // a different casing than Better Auth stored on signup).
    const { data: users, error: listError } = await supabase
      .from('user')
      .select('id, email')
      .ilike('email', email)
      .limit(1)

    if (listError) {
      console.error('[verify] user lookup failed for email', email, listError)
      return NextResponse.json({ error: `Failed to find user (${listError.message})` }, { status: 500 })
    }

    let user = users?.[0]

    // Fallback: try profiles table by email if "user" lookup missed (rare,
    // happens if Better Auth user row was deleted but profile lingers).
    if (!user) {
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', email)
        .limit(1)
        .maybeSingle()
      if (profileByEmail) {
        user = { id: profileByEmail.id, email: profileByEmail.email }
      }
    }

    if (!user) {
      console.error('[verify] no user/profile found for email', email)
      return NextResponse.json({ error: `No account found for ${email}. Sign in to your Zenphony account first, then complete checkout.` }, { status: 404 })
    }

    if (type === 'topup') {
      // Handle top-up purchase
      const minutes = parseInt(metadata.minutes || '0', 10)

      // Get current profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('topup_minutes')
        .eq('id', user.id)
        .single()

      const currentMinutes = profile?.topup_minutes || 0
      const newMinutes = currentMinutes + minutes

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          topup_minutes: newMinutes,
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        type: 'topup',
        minutes: minutes,
        totalMinutes: newMinutes
      })

    } else {
      // Handle subscription purchase
      const planId = metadata.planId
      const billingPeriod = metadata.billingPeriod || 'monthly'
      const minutes = parseInt(metadata.minutes || '0', 10)

      // Map plan to minutes limit
      const minutesMap: Record<string, number> = {
        free: 10,
        basic: 60,
        pro: 240,
        max: 700,
      }

      const updatePayload: Record<string, any> = {
        subscription_plan: planId,
        subscription_status: 'active',
        subscription_period: billingPeriod,
        listening_minutes_limit: minutesMap[planId] || 5,
        listening_minutes_used: 0,
        monthly_minutes: minutesMap[planId] || 5,
        subscription_started_at: new Date().toISOString(),
        chat_tokens_limit: -1, // Paid plans get unlimited chat
      }
      if (session.customer) updatePayload.stripe_customer_id = session.customer as string
      if (session.subscription) updatePayload.stripe_subscription_id = session.subscription as string

      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)
        .select('id, subscription_plan')

      if (updateError) {
        console.error('[verify] profile update failed for user', user.id, updateError)
        return NextResponse.json({ error: `Failed to update profile (${updateError.message})` }, { status: 500 })
      }

      // If no rows were updated, the profile row might be missing — upsert.
      if (!updateData || updateData.length === 0) {
        console.warn('[verify] update touched 0 rows; upserting profile for user', user.id)
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            ...updatePayload,
          }, { onConflict: 'id' })
        if (upsertError) {
          console.error('[verify] profile upsert failed for user', user.id, upsertError)
          return NextResponse.json({ error: `Failed to upsert profile (${upsertError.message})` }, { status: 500 })
        }
      }

      return NextResponse.json({
        success: true,
        type: 'subscription',
        plan: planId,
        billingPeriod: billingPeriod
      })
    }

  } catch (error: any) {
    console.error('Verify checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify checkout' },
      { status: 500 }
    )
  }
}
