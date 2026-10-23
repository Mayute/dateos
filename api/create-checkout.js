import Stripe from 'stripe';
import { getAuthedUser } from './_lib/auth.js';
import { newPrices } from './_lib/stripe-tiers.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const VALID_PLANS = ['pro_monthly', 'pro_annual'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authed = await getAuthedUser(req);
  if (!authed) return res.status(401).json({ error: 'Please sign in first.' });

  const { plan } = req.body ?? {};

  if (!plan || !VALID_PLANS.includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const price = newPrices()[plan];
  if (!price) {
    console.error(`Missing Stripe price env var for ${plan} (STRIPE_PRICE_MONTHLY / STRIPE_PRICE_ANNUAL)`);
    return res.status(503).json({ error: 'Premium is launching soon.', code: 'PAYMENTS_UNAVAILABLE' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: authed.email,
      client_reference_id: authed.authId,
      metadata: { app_email: authed.email },
      line_items: [{ price, quantity: 1 }],
      mode: 'subscription',
      success_url: `https://dateos.io/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://dateos.io/plan`,
      allow_promotion_codes: true,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    // Stripe unreachable / keys invalid / account closed: tell the app to show the "launching soon" panel.
    return res.status(503).json({ error: 'Premium is launching soon.', code: 'PAYMENTS_UNAVAILABLE' });
  }
}