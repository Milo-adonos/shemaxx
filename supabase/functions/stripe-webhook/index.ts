import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const corsHeaders = { 'Access-Control-Allow-Origin': '*' }

const ok  = () => new Response(JSON.stringify({ received: true }), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})
const err = (msg: string, status = 400) =>
  new Response(msg, { status, headers: corsHeaders })

Deno.serve(async (req) => {
  // ── Vérification signature Stripe ─────────────────────────────────────────
  const sig    = req.headers.get('stripe-signature') ?? ''
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
  const body   = await req.text()

  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET not set')
    return err('Webhook secret not configured', 500)
  }

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, secret)
  } catch (e: any) {
    console.error('Signature error:', e.message)
    return err(`Webhook signature error: ${e.message}`, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // ── Helper : upsert abonnement ─────────────────────────────────────────────
  const upsertSub = async (sub: Stripe.Subscription) => {
    // Cherche d'abord par supabase_user_id dans les metadata
    let userId = sub.metadata?.supabase_user_id ?? null

    // Fallback : recherche par stripe_customer_id dans la table
    if (!userId) {
      const { data } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', String(sub.customer))
        .maybeSingle()
      userId = data?.user_id ?? null
    }

    if (!userId) {
      console.warn('No user_id found for subscription', sub.id)
      return
    }

    const periodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null

    const { error } = await supabase.from('subscriptions').upsert({
      user_id:                userId,
      stripe_customer_id:     String(sub.customer),
      stripe_subscription_id: sub.id,
      status:                 sub.status,
      price_id:               sub.items.data[0]?.price?.id ?? null,
      current_period_end:     periodEnd,
    }, { onConflict: 'user_id' })

    if (error) console.error('upsertSub error:', error.message)
    else console.log(`Subscription ${sub.id} → ${sub.status} (user ${userId})`)
  }

  // ── Traitement des événements ──────────────────────────────────────────────
  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.subscription) {
          // Legacy subscription flow
          const sub = await stripe.subscriptions.retrieve(String(session.subscription))
          await upsertSub(sub)

        } else if (session.mode === 'payment') {
          // One-time payment → grant lifetime access
          let userId = session.metadata?.supabase_user_id ?? null

          // Fallback: look up by Stripe customer id
          if (!userId && session.customer) {
            const { data } = await supabase
              .from('subscriptions')
              .select('user_id')
              .eq('stripe_customer_id', String(session.customer))
              .maybeSingle()
            userId = data?.user_id ?? null
          }

          if (userId) {
            const { error } = await supabase.from('subscriptions').upsert({
              user_id:            userId,
              stripe_customer_id: session.customer ? String(session.customer) : null,
              stripe_subscription_id: null,
              status:             'active',
              price_id:           null,
              current_period_end: null,
            }, { onConflict: 'user_id' })
            if (error) console.error('one-time upsert error:', error.message)
            else console.log(`One-time access granted to user ${userId}`)
          } else {
            // Guest user — will be linked after account creation via link-payment
            console.log('Guest one-time payment — will link on account creation')
          }
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await upsertSub(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (e: any) {
    // On logue l'erreur mais on renvoie 200 pour que Stripe n'essaie plus
    console.error('Event processing error:', e.message)
  }

  // Toujours renvoyer 200 → Stripe arrête de réessayer
  return ok()
})
