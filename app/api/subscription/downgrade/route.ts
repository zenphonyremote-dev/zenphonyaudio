import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null

const planConfig: Record<string, {
  name: string
  monthlyPrice: number
  minutes: number
  chatTokensLimit: number
}> = {
  basic: { name: 'Basic', monthlyPrice: 7.99, minutes: 30, chatTokensLimit: -1 },
  pro: { name: 'Pro', monthlyPrice: 29.99, minutes: 120, chatTokensLimit: -1 },
  max: { name: 'Max', monthlyPrice: 69.99, minutes: 350, chatTokensLimit: -1 },
}

const planOrder = ['free', 'basic', 'pro', 'max']

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const { targetPlan } = await request.json()

    if (!targetPlan || !planConfig[targetPlan]) {
      return NextResponse.json({ error: 'Invalid target plan' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_subscription_id, stripe_customer_id, subscription_plan, subscription_period')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const currentPlanIndex = planOrder.indexOf(profile.subscription_plan || 'free')
    const targetPlanIndex = planOrder.indexOf(targetPlan)

    if (targetPlanIndex >= currentPlanIndex) {
      return NextResponse.json({ error: 'Target plan must be lower than current plan. Use checkout to upgrade.' }, { status: 400 })
    }

    if (!profile.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription to downgrade' }, { status: 400 })
    }

    const target = planConfig[targetPlan]

    // Retrieve current subscription
    const currentSub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
    const currentItem = currentSub.items.data[0]

    if (!currentItem) {
      return NextResponse.json({ error: 'No subscription item found' }, { status: 400 })
    }

    const billingInterval = profile.subscription_period === 'yearly' ? 'year' : 'month'
    const unitAmount = billingInterval === 'year'
      ? Math.round(target.monthlyPrice * 10 * 100) // yearly discount approximation
      : Math.round(target.monthlyPrice * 100)

    // Create a new price (prices.create supports product_data; subscriptions.update does not)
    const newPrice = await stripe.prices.create({
      currency: 'usd',
      unit_amount: unitAmount,
      recurring: { interval: billingInterval },
      product_data: { name: `Listen Buddy ${target.name}` },
    })

    // Update Stripe subscription with the new price
    const updatedSub = await stripe.subscriptions.update(profile.stripe_subscription_id, {
      items: [
        {
          id: currentItem.id,
          price: newPrice.id,
        },
      ],
      proration_behavior: 'create_prorations',
    })

    // Update profile in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_plan: targetPlan,
        monthly_minutes: target.minutes,
        listening_minutes_limit: target.minutes,
        listening_minutes_used: 0,
        chat_tokens_limit: target.chatTokensLimit,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile after downgrade:', updateError)
      return NextResponse.json({ error: 'Stripe updated but profile sync failed' }, { status: 500 })
    }

    // Record billing event
    await supabaseAdmin.from('billing_events').insert({
      user_id: user.id,
      event_type: 'subscription_downgraded',
      amount_cents: unitAmount,
      plan_from: profile.subscription_plan,
      plan_to: targetPlan,
      description: `Downgraded from ${profile.subscription_plan} to ${targetPlan}`,
    })

    return NextResponse.json({
      success: true,
      message: `Downgraded to ${target.name} plan.`,
      newPlan: targetPlan,
    })
  } catch (error: any) {
    console.error('Downgrade error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to downgrade subscription' },
      { status: 500 }
    )
  }
}
