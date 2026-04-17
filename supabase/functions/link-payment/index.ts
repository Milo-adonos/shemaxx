import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
})

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Not authenticated' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return json({ error: 'Invalid token' }, 401)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Find the Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email!, limit: 5 })
    if (!customers.data.length) return json({ error: 'No payment found for this email' }, 404)

    const customer = customers.data[0]

    // ── Try one-time payment first (checkout session) ──────────────────────────
    const sessions = await stripe.checkout.sessions.list({
      customer: customer.id,
      limit: 10,
    })
    const paidSession = sessions.data.find(
      s => s.mode === 'payment' && s.payment_status === 'paid'
    )

    if (paidSession) {
      const { error: upsertError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id:                user.id,
          stripe_customer_id:     customer.id,
          stripe_subscription_id: null,
          status:                 'active',
          price_id:               null,
          current_period_end:     null,
        }, { onConflict: 'user_id' })

      if (upsertError) return json({ error: upsertError.message }, 500)

      // Tag the Stripe customer with the user id for future webhook events
      await stripe.customers.update(customer.id, {
        metadata: { supabase_user_id: user.id },
      }).catch(() => { /* non-blocking */ })

      return json({ success: true, type: 'one_time' })
    }

    // ── Fallback: look for an active subscription ──────────────────────────────
    const subs = await stripe.subscriptions.list({ customer: customer.id, limit: 5 })
    const activeSub = subs.data.find(s => ['active', 'trialing', 'past_due'].includes(s.status))
      ?? subs.data[0]

    if (!activeSub) return json({ error: 'No payment found — check your email.' }, 404)

    const periodEnd = activeSub.current_period_end
      ? new Date(activeSub.current_period_end * 1000).toISOString()
      : null

    const { error: upsertError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id:                user.id,
        stripe_customer_id:     customer.id,
        stripe_subscription_id: activeSub.id,
        status:                 activeSub.status,
        price_id:               activeSub.items.data[0]?.price.id ?? null,
        current_period_end:     periodEnd,
      }, { onConflict: 'user_id' })

    if (upsertError) return json({ error: upsertError.message }, 500)

    await stripe.customers.update(customer.id, {
      metadata: { supabase_user_id: user.id },
    }).catch(() => { /* non-blocking */ })
    await stripe.subscriptions.update(activeSub.id, {
      metadata: { supabase_user_id: user.id },
    }).catch(() => { /* non-blocking */ })

    return json({ success: true, type: 'subscription' })
  } catch (err: any) {
    return json({ error: err?.message || 'Unknown error' }, 500)
  }
})
