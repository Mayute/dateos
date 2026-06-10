import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  single: {
    price: 'price_1TfJkg4k0yTy8gV1EfCvN0Rl',
    mode: 'payment',
  },
  pro_monthly: {
    price: 'price_1TfJmy4k0yTy8gV1VSfgg0qs',
    mode: 'subscription',
  },
  pro_annual: {
    price: 'price_1TfJo64k0yTy8gV1GTAKZg5k',
    mode: 'subscription',
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { plan, email } = req.body;

  if (!plan || !PLANS[plan]) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: email || undefined,
      line_items: [{ price: PLANS[plan].price, quantity: 1 }],
      mode: PLANS[plan].mode,
      success_url: `https://dateos.io/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://dateos.io/plan`,
      allow_promotion_codes: true,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}