import { supabase } from './supabase'

export type UserRecord = {
  id: string
  email: string
  stripe_email: string | null
  stripe_customer_id: string | null
  tier: 'free' | 'single' | 'pro_monthly' | 'pro_annual'
  plans_generated: number
  is_paid: boolean
  free_plans_reset_month: string | null
  single_plans_remaining: number
}

const SESSION_KEY = 'dateos_user_email'

export function getStoredEmail(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function setStoredEmail(email: string) {
  localStorage.setItem(SESSION_KEY, email)
}

function currentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}`
}

export async function getOrCreateUser(email: string): Promise<UserRecord> {
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (existing) return existing

  const { data: created, error } = await supabase
    .from('users')
    .insert({ email: email.toLowerCase() })
    .select()
    .single()

  if (error) throw new Error('Failed to create user: ' + error.message)
  return created
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()
  return data
}

export async function incrementPlanCount(email: string) {
  const user = await getUserByEmail(email)
  if (!user) return

  const monthKey = currentMonthKey()

  if (user.tier === 'free' || !user.is_paid) {
    // Reset monthly counter if new month
    const resetMonth = user.free_plans_reset_month
    const newCount = resetMonth === monthKey ? user.plans_generated + 1 : 1
    await supabase
      .from('users')
      .update({
        plans_generated: newCount,
        free_plans_reset_month: monthKey,
      })
      .eq('email', email.toLowerCase())
  } else if (user.tier === 'single') {
    // Decrement single plans remaining
    await supabase
      .from('users')
      .update({
        plans_generated: user.plans_generated + 1,
        single_plans_remaining: Math.max(0, user.single_plans_remaining - 1),
      })
      .eq('email', email.toLowerCase())
  } else {
    // Pro — just increment
    await supabase
      .from('users')
      .update({ plans_generated: user.plans_generated + 1 })
      .eq('email', email.toLowerCase())
  }
}

export function canGeneratePlan(user: UserRecord): { allowed: boolean; reason?: string } {
  // Pro — unlimited
  if (user.tier === 'pro_monthly' || user.tier === 'pro_annual') return { allowed: true }

  // Single plan — check remaining
  if (user.tier === 'single') {
    if (user.single_plans_remaining > 0) return { allowed: true }
    return { allowed: false, reason: 'Single plan used' }
  }

  // Free — 1 plan per month
  const monthKey = currentMonthKey()
  const isNewMonth = user.free_plans_reset_month !== monthKey
  if (isNewMonth || user.plans_generated < 1) return { allowed: true }

  return { allowed: false, reason: 'Free plan used this month' }
}