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

    // Recherche le customer Stripe par email
    const customers = await stripe.customers.list({ email: user.email!, limit: 5 })
    if (!customers.data.length) return json({ error: 'No payment found for this email' }, 404)

    // Prend le customer le plus récent
    const customer = customers.data[0]

    // Cherche un abonnement actif ou récent
    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      limit:    5,
    })

    const activeSub = subs.data.find(s => ['active', 'trialing', 'past_due'].includes(s.status))
      ?? subs.data[0]

    if (!activeSub) {
      return json({ error: 'No subscription found — check your payment.' }, 404)
    }

    // Upsert dans la table subscriptions
    const { error: upsertError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id:                user.id,
        stripe_customer_id:     customer.id,
        stripe_subscription_id: activeSub.id,
        status:                 activeSub.status,
        price_id:               activeSub.items.data[0]?.price.id ?? null,
        current_period_end:     new Date(activeSub.current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' })

    if (upsertError) return json({ error: upsertError.message }, 500)

    // Met aussi à jour le metadata Stripe du customer + subscription
    await stripe.customers.update(customer.id, {
      metadata: { supabase_user_id: user.id },
    }).catch(() => { /* non bloquant */ })

    await stripe.subscriptions.update(activeSub.id, {
      metadata: { supabase_user_id: user.id },
    }).catch(() => { /* non bloquant */ })

    return json({ success: true })
  } catch (err: any) {
    return json({ error: err?.message || 'Unknown error' }, 500)
  }
})
