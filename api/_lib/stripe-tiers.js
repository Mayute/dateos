// Maps a Stripe price ID to a DateOS tier.
//
// New prices come from Vercel environment variables:
//   STRIPE_PRICE_MONTHLY  ($7.99 / month)
//   STRIPE_PRICE_ANNUAL   ($59 / year)
// Old price IDs stay mapped so existing customers keep working.

const LEGACY = {
    'price_1TgwO74k0yTy8gV1fFpnfiYl': 'single',       // old Single $7.99 (one-time)
    'price_1TfJkg4k0yTy8gV1EfCvN0Rl': 'single',       // older Single
    'price_1TfJmy4k0yTy8gV1VSfgg0qs': 'pro_monthly',  // old Pro Monthly $19.99
    'price_1TfJo64k0yTy8gV1GTAKZg5k': 'pro_annual',   // old Pro Annual $179
  };
  
  export function newPrices() {
    return {
      pro_monthly: process.env.STRIPE_PRICE_MONTHLY,
      pro_annual: process.env.STRIPE_PRICE_ANNUAL,
    };
  }
  
  /** Returns the tier for a price ID, or null if the price is unknown. */
  export function tierForPrice(priceId) {
    if (!priceId) return null;
    const prices = newPrices();
    if (priceId === prices.pro_monthly) return 'pro_monthly';
    if (priceId === prices.pro_annual) return 'pro_annual';
    return LEGACY[priceId] ?? null;
  }