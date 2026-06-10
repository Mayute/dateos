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

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email?.toLowerCase();
    const customerId = session.customer;
    const priceId = session.line_items?.data?.[0]?.price?.id ?? '';
    const tier = TIER_MAP[priceId] ?? 'single';

    if (email) {
      await supabase
        .from('users')
        .upsert({
          email,
          stripe_customer_id: customerId,
          tier,
          is_paid: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    const customerId = sub.customer;

    await supabase
      .from('users')
      .update({ tier: 'free', is_paid: false, stripe_subscription_id: null })
      .eq('stripe_customer_id', customerId);
  }

  res.status(200).json({ received: true });
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}