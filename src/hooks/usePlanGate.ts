// Legacy exports kept for compatibility during transition
// Real logic is now in src/lib/userStore.ts

export function isPaid(): boolean {
  return false
}

export function markPaid(): void {}

export function markSinglePlan(): void {}

export function isAtLimit(): boolean {
  return false
}

export function incrementPlanCount(): void {}

export function plansRemaining(): number {
  return 2
}