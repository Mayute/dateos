import { currentMonthKey } from './limits.js';

// Treat email aliases of the same inbox as one person for the free-plan limits.
//   name+anything@domain.com  -> name@domain.com
//   gmail only: dots are ignored, googlemail.com == gmail.com
export function canonicalEmail(email) {
  const clean = String(email || '').toLowerCase().trim();
  const at = clean.lastIndexOf('@');
  if (at < 1) return clean;
  let local = clean.slice(0, at).split('+')[0];
  let domain = clean.slice(at + 1);
  if (domain === 'googlemail.com') domain = 'gmail.com';
  if (domain === 'gmail.com') local = local.replace(/\./g, '');
  return `${local}@${domain}`;
}

// Throwaway-inbox providers. Not exhaustive: it stops the common ones.
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com',
  'sharklasers.com', 'grr.la', 'spam4.me', '10minutemail.com', '10minutemail.net', '20minutemail.com',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net', 'tempmailo.com', 'tempail.com',
  'yopmail.com', 'yopmail.net', 'yopmail.fr', 'trashmail.com', 'trashmail.net', 'throwawaymail.com',
  'getnada.com', 'nada.email', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com', 'mailnesia.com',
  'mintemail.com', 'mohmal.com', 'moakt.com', 'emailondeck.com', 'burnermail.io', 'mytemp.email',
  'discard.email', 'mailcatch.com', 'spamgourmet.com', 'getairmail.com', 'inboxkitten.com',
  'tmpmail.org', 'tmpmail.net', 'harakirimail.com', 'mailtemp.net', 'emailfake.com', 'fakemail.net',
  'tempinbox.com', 'owlymail.com', 'minuteinbox.com', 'luxusmail.org', 'mail.tm', 'tmail.ws',
]);

export function isDisposableEmail(email) {
  const domain = String(email || '').toLowerCase().split('@')[1] || '';
  return DISPOSABLE_DOMAINS.has(domain);
}

/** Free-plan usage already spent by OTHER accounts that share this person's canonical email. */
export async function siblingUsage(admin, user) {
  const canon = user.canonical_email || canonicalEmail(user.email);
  const { data, error } = await admin
    .from('users')
    .select('email, trial_plans_used, monthly_plans_used, free_plans_reset_month')
    .eq('canonical_email', canon)
    .neq('email', user.email);
  if (error) throw error;

  const month = currentMonthKey();
  let trial = 0;
  let monthly = 0;
  for (const r of data ?? []) {
    trial += r.trial_plans_used ?? 0;
    if (r.free_plans_reset_month === month) monthly += r.monthly_plans_used ?? 0;
  }
  return { trial, monthly };
}

/** Copy of the user row whose counters include the siblings' usage, for showing the right counter. */
export function withGroupUsage(user, sib) {
  const month = currentMonthKey();
  const ownMonthly = user.free_plans_reset_month === month ? (user.monthly_plans_used ?? 0) : 0;
  const monthly = ownMonthly + sib.monthly;
  return {
    ...user,
    trial_plans_used: (user.trial_plans_used ?? 0) + sib.trial,
    monthly_plans_used: monthly,
    free_plans_reset_month: monthly > 0 ? month : user.free_plans_reset_month,
  };
}