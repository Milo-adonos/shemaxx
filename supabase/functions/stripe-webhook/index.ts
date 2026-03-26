import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const corsHeaders = { 'Access-Control-Allow-Origin': '*' }

Deno.serve(async (req) => {
  const sig     = req.headers.get('stripe-signature') ?? ''
  const secret  = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
  const body    = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, secret)
  } catch (err) {
    return new Response(`Webhook signature error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const upsertSub = async (sub: Stripe.Subscription) => {
    const userId = sub.metadata?.supabase_user_id
    if (!userId) return
    await supabase.from('subscriptions').upsert({
      user_id:              userId,
      stripe_customer_id:   String(sub.customer),
      stripe_subscription_id: sub.id,
      status:               sub.status,
      price_id:             sub.items.data[0]?.price?.id ?? null,
      current_period_end:   new Date(sub.current_period_end * 1000).toISOString(),
      updated_at:           new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'subscription' && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(String(session.subscription))
        await upsertSub(sub)
      }
      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await upsertSub(event.data.object as Stripe.Subscription)
      break
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
