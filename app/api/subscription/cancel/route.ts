import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null

export async function POST() {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role for admin update
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_subscription_id, subscription_plan')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.subscription_plan === 'free') {
      return NextResponse.json({ error: 'Already on free plan' }, { status: 400 })
    }

    // Cancel Stripe subscription immediately
    if (profile.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id)
      } catch (err: any) {
        console.error('Error cancelling Stripe subscription:', err)
        // Continue even if Stripe cancel fails (sub may already be cancelled)
      }
    }

    // Downgrade profile to free plan
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_plan: 'free',
        subscription_status: 'cancelled',
        listening_minutes_limit: 5,
        listening_minutes_used: 0,
        monthly_minutes: 5,
        stripe_subscription_id: null,
        chat_tokens_limit: 50000,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled. You are now on the Free plan.',
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
