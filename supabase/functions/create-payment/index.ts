import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated — invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // type: 'analysis' | 'extra_style' | 'extra_10' | 'extra_ranking' | 'extra_advice'
    const body = await req.json()
    const { priceId, successUrl, cancelUrl, type } = body
    if (!priceId || !successUrl || !cancelUrl) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer_email:       user.email,
      mode:                 'payment',
      payment_method_types: ['card'],
      line_items:           [{ price: priceId, quantity: 1 }],
      success_url:          `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:           cancelUrl,
      metadata:             { supabase_user_id: user.id, payment_type: type ?? 'analysis' },
      payment_intent_data:  { statement_descriptor: 'SHEMAXX' },
      automatic_tax:        { enabled: false },
      locale:               'en',
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    const msg = err?.message || String(err) || 'Unknown error'
    const status = err?.statusCode ?? err?.status ?? 400
    return new Response(JSON.stringify({ error: msg }), {
      status: typeof status === 'number' && status >= 400 && status < 600 ? status : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
