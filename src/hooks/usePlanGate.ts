const COUNT_KEY = 'dateos_plan_count';
const RESET_KEY = 'dateos_reset_date';
const PAID_KEY = 'dateos_paid';
const FREE_LIMIT = 2;

export function isPaid(): boolean {
  return localStorage.getItem(PAID_KEY) === 'true';
}

export function markPaid(): void {
  localStorage.setItem(PAID_KEY, 'true');
  localStorage.removeItem(COUNT_KEY);
  localStorage.removeItem(RESET_KEY);
}

export function markSinglePlan(): void {
  const current = getCount();
  localStorage.setItem(COUNT_KEY, String(Math.max(0, current - 1)));
}

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

function getCount(): number {
  const monthKey = currentMonthKey();
  const stored = localStorage.getItem(RESET_KEY);
  if (stored !== monthKey) {
    localStorage.setItem(RESET_KEY, monthKey);
    localStorage.setItem(COUNT_KEY, '0');
    return 0;
  }
  const raw = localStorage.getItem(COUNT_KEY);
  if (raw === null) {
    localStorage.setItem(COUNT_KEY, '0');
    return 0;
  }
  const count = parseInt(raw, 10);
  if (isNaN(count) || count < 0) {
    localStorage.setItem(COUNT_KEY, '0');
    return 0;
  }
  return count;
}

export function isAtLimit(): boolean {
  if (isPaid()) return false;
  return getCount() >= FREE_LIMIT;
}

export function incrementPlanCount(): void {
  const current = getCount();
  localStorage.setItem(COUNT_KEY, String(current + 1));
}

export function plansRemaining(): number {
  return Math.max(0, FREE_LIMIT - getCount());
}
