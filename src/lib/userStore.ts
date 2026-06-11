import { supabase } from './supabase'

export type UserRecord = {
  id: string
  email: string
  stripe_email: string | null
  stripe_customer_id: string | null
  tier: 'free' | 'single' | 'pro_monthly' | 'pro_annual'
  plans_generated: number
  is_paid: boolean
}

const SESSION_KEY = 'dateos_user_email'

export function getStoredEmail(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function setStoredEmail(email: string) {
  localStorage.setItem(SESSION_KEY, email)
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
  await supabase
    .from('users')
    .update({ plans_generated: user.plans_generated + 1 })
    .eq('email', email.toLowerCase())
}

export function canGeneratePlan(user: UserRecord): { allowed: boolean; reason?: string } {
  if (user.is_paid) return { allowed: true }
  if (user.plans_generated < 1) return { allowed: true }
  return { allowed: false, reason: 'Free limit reached' }
}