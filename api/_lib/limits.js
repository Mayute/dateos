// Single source of truth for plan limits (server side).
//
// Model:
//   Free users : 5 full-feature "trial" plans (lifetime), then 1 itinerary-only plan per month.
//   Premium    : unlimited full-feature plans, with a fair-use ceiling per month.
//   Legacy "single" buyers keep the one plan they paid for.
//
// Month key format matches what the old code stored, e.g. "2026-10".

export const TRIAL_PLANS = 5;
export const FREE_MONTHLY_PLANS = 1;
export const PAID_FAIR_USE_PER_MONTH = 30;

export function currentMonthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
}

export function isPremiumTier(tier) {
  return tier === 'pro_monthly' || tier === 'pro_annual';
}

/**
 * Decides whether this user may generate a plan right now.
 * Returns:
 *   { allowed: false, reason: 'LIMIT' | 'FAIR_USE' }
 *   { allowed: true, access: 'full' | 'limited', patch }   // patch = columns to write to spend the plan
 */
export function evaluateUsage(user) {
  const monthKey = currentMonthKey();
  const sameMonth = user.free_plans_reset_month === monthKey;
  const monthlyUsed = sameMonth ? (user.monthly_plans_used ?? 0) : 0;
  const lifetime = (user.plans_generated ?? 0) + 1;

  // Premium
  if (isPremiumTier(user.tier)) {
    if (monthlyUsed >= PAID_FAIR_USE_PER_MONTH) return { allowed: false, reason: 'FAIR_USE' };
    return {
      allowed: true,
      access: 'full',
      patch: {
        plans_generated: lifetime,
        free_plans_reset_month: monthKey,
        monthly_plans_used: monthlyUsed + 1,
      },
    };
  }

  // Legacy one-time "single" purchase: honor the plan they paid for
  if (user.tier === 'single' && (user.single_plans_remaining ?? 0) > 0) {
    return {
      allowed: true,
      access: 'full',
      patch: {
        plans_generated: lifetime,
        single_plans_remaining: user.single_plans_remaining - 1,
      },
    };
  }

  // Free: trial first
  if ((user.trial_plans_used ?? 0) < TRIAL_PLANS) {
    return {
      allowed: true,
      access: 'full',
      patch: {
        plans_generated: lifetime,
        trial_plans_used: (user.trial_plans_used ?? 0) + 1,
      },
    };
  }

  // Free: after the trial, 1 itinerary-only plan a month
  if (monthlyUsed < FREE_MONTHLY_PLANS) {
    return {
      allowed: true,
      access: 'limited',
      patch: {
        plans_generated: lifetime,
        free_plans_reset_month: monthKey,
        monthly_plans_used: monthlyUsed + 1,
      },
    };
  }

  return { allowed: false, reason: 'LIMIT' };
}

/** Removes the premium sections so free "limited" users never receive them. */
export function stripPremiumFields(plan) {
  return { ...plan, dress_code: '', date_tips: [] };
}