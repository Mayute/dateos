const COUNT_KEY = 'dateos_plan_count';
const RESET_KEY = 'dateos_reset_date';
const FREE_LIMIT = 2;

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

function getCount(): number {
  const stored = localStorage.getItem(RESET_KEY);
  if (stored !== currentMonthKey()) {
    localStorage.setItem(RESET_KEY, currentMonthKey());
    localStorage.setItem(COUNT_KEY, '0');
    return 0;
  }
  return parseInt(localStorage.getItem(COUNT_KEY) ?? '0', 10);
}

export function isAtLimit(): boolean {
  return getCount() >= FREE_LIMIT;
}

export function incrementPlanCount(): void {
  const current = getCount();
  localStorage.setItem(COUNT_KEY, String(current + 1));
}

export function plansRemaining(): number {
  return Math.max(0, FREE_LIMIT - getCount());
}
