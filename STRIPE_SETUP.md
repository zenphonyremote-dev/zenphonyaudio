# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for Listen Buddy subscriptions.

## Prerequisites

1. **Stripe Account**: Create a free Stripe account at [stripe.com](https://stripe.com)
2. **Products**: Create 4 products/prices in Stripe Dashboard for your plans
3. **Webhook**: Set up a webhook endpoint in Stripe

## Step 1: Create Stripe Products & Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/products)
2. Click "Add product" for each plan:

### Free Trial (Optional)
- Name: Listen Buddy - Free Trial
- Description: 5 minutes of audio analysis
- Price: $0.00 (one-time or free trial)

### Economy Plan
- Name: Listen Buddy - Economy
- Description: 30 minutes/month, Basic frequency analysis
- Price: $7.99/month
- Recurring: Monthly

### Pro Plan
- Name: Listen Buddy - Pro
- Description: 5 hours/month, Full analysis suite
- Price: $25.00/month
- Recurring: Monthly

### Master Plan
- Name: Listen Buddy - Master
- Description: Unlimited listening, Advanced diagnostics
- Price: $55.00/month
- Recurring: Monthly

## Step 2: Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)
   - **Webhook signing secret** (create webhook first, then get secret)

## Step 3: Configure Environment Variables

Update your `.env.local` file with your Stripe credentials:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
STRIPE_PRICE_ECONOMY=price_your_economy_price_id
STRIPE_PRICE_PRO=price_your_pro_price_id
STRIPE_PRICE_MASTER=price_your_master_price_id
```

**Important:**
- Replace the placeholder values with your actual Stripe keys
- Keep these values secret - never commit `.env.local` to git
- For production, use live keys (sk_live_...) instead of test keys

## Step 4: Set Up Webhook

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter: `https://your-domain.com/api/stripe-webhook`
   - For local development: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) or ngrok
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret
6. Add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Local Development with Stripe CLI

```bash
# Install Stripe CLI
npm install -g stripe

# Login to Stripe
stripe login

# Forward webhook to localhost
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

### Local Development with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Use the ngrok URL for webhook
# e.g., https://abc123.ngrok.io/api/stripe-webhook
```

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to Listen Buddy page: `http://localhost:3000/products/listen-buddy#pricing`

3. Click "Choose Plan" on any paid plan

4. You should be redirected to `/checkout?plan=pro`

5. Click "Proceed to Checkout"

6. Complete the Stripe test payment (use test card: 4242 4242 4242 4242)

7. After payment, you'll be redirected to `/checkout/success`

## How It Works

### Flow Diagram

```
User clicks "Choose Plan"
  ↓
Navigate to /checkout?plan=pro
  ↓
User reviews order and clicks "Proceed to Checkout"
  ↓
POST /api/checkout
  ↓
Stripe creates checkout session
  ↓
Redirect to Stripe Checkout
  ↓
User completes payment
  ↓
Stripe sends webhook event
  ↓
POST /api/stripe-webhook
  ↓
Update user profile in Supabase
  ↓
Redirect to /checkout/success
```

### API Routes

- **`POST /api/checkout`**: Creates Stripe checkout session
- **`POST /api/stripe-webhook`**: Handles Stripe webhook events

### Database Updates

The webhook updates the user's profile in Supabase:
- `subscription_plan`: The plan ID (economy, pro, master)
- `subscription_status`: active, cancelled, or past_due
- `stripe_customer_id`: Customer ID from Stripe
- `stripe_subscription_id`: Subscription ID from Stripe

## Troubleshooting

### Webhook Not Receiving Events

1. Check if webhook URL is accessible
2. Verify Stripe CLI or ngrok is running
3. Check Stripe Dashboard webhook logs for errors
4. Ensure webhook secret matches

### Checkout Fails

1. Check console for error messages
2. Verify Stripe keys are correct in `.env.local`
3. Ensure price IDs match your Stripe products
4. Check Stripe Dashboard for failed payments

### Payment Not Updating Profile

1. Check webhook logs in terminal
2. Verify Supabase connection
3. Check if user email matches Stripe customer email
4. Ensure `stripe_customer_id` and `stripe_subscription_id` fields exist in profiles table

## Production Checklist

Before going live:

- [ ] Switch from test keys to live keys
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production URL
- [ ] Update webhook URL to production endpoint
- [ ] Test with real payment method
- [ ] Verify subscription management works
- [ ] Set up cancellation flow

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Verify webhook signatures on your server
- Use HTTPS in production
- Implement proper error handling for failed payments

## Support

For issues:
- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Supabase Docs: https://supabase.com/docs
