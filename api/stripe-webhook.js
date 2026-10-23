import Stripe from 'stripe';
import { admin as supabase } from './_lib/auth.js';
import { tierForPrice } from './_lib/stripe-tiers.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


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
    const eventSession = event.data.object;
    // The webhook payload does not include line items, so fetch them. Without this
    // every purchase fell back to 'single' and could overwrite a correct Pro tier.
    const session = await stripe.checkout.sessions.retrieve(eventSession.id, { expand: ['line_items'] });
    const email = (session.metadata?.app_email || session.customer_details?.email)?.toLowerCase();
    const customerId = session.customer;
    const priceId = session.line_items?.data?.[0]?.price?.id ?? '';
    const tier = tierForPrice(priceId);
    if (!tier) {
      // Return an error so Stripe shows the failure and retries, instead of guessing a tier.
      console.error('Unknown Stripe price ID in webhook:', priceId);
      return res.status(500).json({ error: 'Unknown price' });
    }

    if (email) {
        await supabase
        .from('users')
        .upsert({
          email,
          stripe_customer_id: customerId,
          tier,
          is_paid: true,
          single_plans_remaining: tier === 'single' ? 1 : 0,
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