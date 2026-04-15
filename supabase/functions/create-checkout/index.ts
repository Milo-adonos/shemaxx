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
    const body = await req.json()
    const { priceId, successUrl, cancelUrl, guest_email } = body

    if (!priceId || !successUrl || !cancelUrl) {
      return json({ error: 'Paramètres manquants (priceId, successUrl, cancelUrl)' }, 400)
    }

    const authHeader = req.headers.get('Authorization')
    let userEmail: string | null = null
    let userId:    string | null = null

    if (authHeader) {
      // Utilisateur connecté — flux normal
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } },
      )
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return json({ error: 'Token invalide' }, 401)
      userEmail = user.email ?? null
      userId    = user.id
    } else {
      // Mode invité — l'email est optionnel, Stripe le collecte pendant le paiement
      userEmail = guest_email ?? null
    }

    const session = await stripe.checkout.sessions.create({
      ...(userEmail ? { customer_email: userEmail } : {}),
      mode:                 'subscription',
      payment_method_types: ['card'],
      line_items:           [{ price: priceId, quantity: 1 }],
      success_url:          `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:           cancelUrl,
      metadata:             {
        ...(userId ? { supabase_user_id: userId } : {}),
        guest_email: userEmail ?? '',
      },
      subscription_data: {
        metadata: {
          ...(userId ? { supabase_user_id: userId } : {}),
          guest_email: userEmail ?? '',
        },
      },
      payment_method_options: {
        card: { request_three_d_secure: 'automatic' },
      },
      automatic_tax: { enabled: false },
      locale:        'en',
    })

    return json({ url: session.url })
  } catch (err: any) {
    const msg    = err?.message || String(err) || 'Erreur inconnue'
    const status = err?.statusCode ?? err?.status ?? 400
    return new Response(JSON.stringify({ error: msg }), {
      status: typeof status === 'number' && status >= 400 && status < 600 ? status : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
