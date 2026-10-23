import Stripe from 'stripe';
import { admin as supabase, getAuthedUser } from './_lib/auth.js';
import { tierForPrice } from './_lib/stripe-tiers.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authed = await getAuthedUser(req);
  if (!authed) return res.status(401).json({ error: 'Please sign in.' });

  const { session_id } = req.body ?? {};
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer', 'line_items'],
    });

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // The checkout must have been started by this same signed-in account.
    if (session.metadata?.app_email && session.metadata.app_email !== authed.email) {
      return res.status(403).json({ error: 'This payment belongs to a different account.' });
    }

    const customer = session.customer;
    const customerId = typeof customer === 'string' ? customer : customer?.id;
    const stripeEmail = typeof customer === 'string' ? null : customer?.email;
    const priceId = session.line_items?.data?.[0]?.price?.id ?? '';
    const tier = tierForPrice(priceId);
    if (!tier) {
      // Never guess a tier for a paying customer; surface it instead.
      console.error('Unknown Stripe price ID in confirm-session:', priceId);
      return res.status(500).json({ error: 'Unrecognized plan. Please contact support.' });
    }

    await supabase
  .from('users')
  .update({
    stripe_customer_id: customerId,
    stripe_email: stripeEmail,
    tier,
    is_paid: true,
    single_plans_remaining: tier === 'single' ? 1 : 0,
    updated_at: new Date().toISOString(),
  })
  .eq('email', authed.email);

    return res.json({ success: true, tier });
  } catch (err) {
    console.error('Confirm session error:', err);
    return res.status(500).json({ error: 'Failed to confirm session' });
  }
}