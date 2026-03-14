import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// CORS headers for cross-origin requests from the plugin WebView
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(body: any, init?: { status?: number }) {
  return NextResponse.json(body, { ...init, headers: corsHeaders })
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null

let supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseAdmin
}

const planConfig: Record<string, { name: string; monthlyPrice: number; minutes: number }> = {
  basic: { name: 'Basic', monthlyPrice: 7.99, minutes: 30 },
  pro: { name: 'Pro', monthlyPrice: 29.99, minutes: 120 },
  max: { name: 'Max', monthlyPrice: 69.99, minutes: 350 },
}

const planOrder = ['free', 'basic', 'pro', 'max']

// Helper: look up profile by API key
async function getProfileByApiKey(apiKey: string) {
  if (!apiKey.startsWith('lb_') || apiKey.length !== 35) return null
  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('profiles')
    .select('id, stripe_subscription_id, stripe_customer_id, subscription_plan, subscription_period')
    .eq('api_key', apiKey)
    .single()
  if (error || !data) return null
  return data
}

// POST /api/plugin/subscription — cancel or downgrade
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = authHeader.replace('Bearer ', '').trim()
    const profile = await getProfileByApiKey(apiKey)
    if (!profile) {
      return json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { action, targetPlan } = await request.json()
    const admin = getSupabaseAdmin()

    // ── CANCEL ──
    if (action === 'cancel') {
      if (profile.subscription_plan === 'free') {
        return json({ error: 'Already on free plan' }, { status: 400 })
      }

      // Cancel Stripe subscription
      if (stripe && profile.stripe_subscription_id) {
        try {
          await stripe.subscriptions.cancel(profile.stripe_subscription_id)
        } catch (err: any) {
          console.error('Error cancelling Stripe subscription:', err)
        }
      }

      // Downgrade to free
      await admin
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
        .eq('id', profile.id)

      return json({
        success: true,
        message: 'Subscription cancelled. You are now on the Free plan.',
        newPlan: 'free',
      })
    }

    // ── DOWNGRADE ──
    if (action === 'downgrade') {
      if (!targetPlan || !planConfig[targetPlan]) {
        return json({ error: 'Invalid target plan' }, { status: 400 })
      }

      const currentIndex = planOrder.indexOf(profile.subscription_plan || 'free')
      const targetIndex = planOrder.indexOf(targetPlan)

      if (targetIndex >= currentIndex) {
        return json({ error: 'Target plan must be lower than current plan' }, { status: 400 })
      }

      if (!stripe || !profile.stripe_subscription_id) {
        return json({ error: 'No active Stripe subscription' }, { status: 400 })
      }

      const target = planConfig[targetPlan]
      const currentSub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
      const currentItem = currentSub.items.data[0]

      if (!currentItem) {
        return json({ error: 'No subscription item found' }, { status: 400 })
      }

      const billingInterval = profile.subscription_period === 'yearly' ? 'year' : 'month'
      const unitAmount = billingInterval === 'year'
        ? Math.round(target.monthlyPrice * 10 * 100)
        : Math.round(target.monthlyPrice * 100)

      // Ensure the product is active (Stripe rejects price_data on inactive products)
      const productId = typeof currentItem.price.product === 'string'
        ? currentItem.price.product
        : currentItem.price.product.id
      await stripe.products.update(productId, { active: true })

      await stripe.subscriptions.update(profile.stripe_subscription_id, {
        items: [
          {
            id: currentItem.id,
            price_data: {
              currency: 'usd',
              product: productId,
              unit_amount: unitAmount,
              recurring: { interval: billingInterval },
            },
          },
        ],
        proration_behavior: 'create_prorations',
      })

      await admin
        .from('profiles')
        .update({
          subscription_plan: targetPlan,
          monthly_minutes: target.minutes,
          listening_minutes_limit: target.minutes,
          listening_minutes_used: 0,
          chat_tokens_limit: -1,
        })
        .eq('id', profile.id)

      return json({
        success: true,
        message: `Downgraded to ${target.name} plan.`,
        newPlan: targetPlan,
      })
    }

    return json({ error: 'Invalid action. Use "cancel" or "downgrade".' }, { status: 400 })
  } catch (error: any) {
    console.error('Plugin subscription action error:', error)
    return json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
