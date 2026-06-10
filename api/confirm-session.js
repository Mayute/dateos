import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TIER_MAP = {
  'price_1TfJkg4k0yTy8gV1EfCvN0Rl': 'single',
  'price_1TfJmy4k0yTy8gV1VSfgg0qs': 'pro_monthly',
  'price_1TfJo64k0yTy8gV1GTAKZg5k': 'pro_annual',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { session_id, app_email } = req.body;

  if (!session_id || !app_email) {
    return res.status(400).json({ error: 'Missing session_id or app_email' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer', 'line_items'],
    });

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const customer = session.customer;
    const customerId = typeof customer === 'string' ? customer : customer?.id;
    const stripeEmail = typeof customer === 'string' ? null : customer?.email;
    const priceId = session.line_items?.data?.[0]?.price?.id ?? '';
    const tier = TIER_MAP[priceId] ?? 'single';

    await supabase
      .from('users')
      .update({
        stripe_customer_id: customerId,
        stripe_email: stripeEmail,
        tier,
        is_paid: true,
        updated_at: new Date().toISOString(),
      })
      .eq('email', app_email.toLowerCase());

    return res.json({ success: true, tier });
  } catch (err) {
    console.error('Confirm session error:', err);
    return res.status(500).json({ error: 'Failed to confirm session' });
  }
}