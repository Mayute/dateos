import { supabase } from './supabase'
import type { SavedPlan, DatePlan, PlanFormData } from '../types'

export type UserRecord = {
  id: string
  email: string
  name: string | null
  email_verified: boolean
  stripe_email: string | null
  stripe_customer_id: string | null
  tier: 'free' | 'single' | 'pro_monthly' | 'pro_annual'
  plans_generated: number
  trial_plans_used: number
  monthly_plans_used: number
  is_paid: boolean
  free_plans_reset_month: string | null
  single_plans_remaining: number
}

/**
 * Identity now comes from the Supabase session (set by verifyOtp), not from localStorage.
 * These helpers are kept only so stale values from the old flow can be cleaned up.
 */
const LEGACY_EMAIL_KEY = 'dateos_user_email'
const LEGACY_NAME_KEY = 'dateos_user_name'

export function clearLocalIdentity() {
  try {
    localStorage.removeItem(LEGACY_EMAIL_KEY)
    localStorage.removeItem(LEGACY_NAME_KEY)
    sessionStorage.removeItem('dateos_user')
    sessionStorage.removeItem('dateos_result')
  } catch {
    // storage can be unavailable (private mode) - nothing to clean up then
  }
}

function currentMonthKey(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`
}

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

/** fetch() that attaches the signed-in user's Supabase token. */
export async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(path, { ...init, headers })
}

/** Email of the verified session, or null when signed out. */
export async function getSessionEmail(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.email?.toLowerCase() ?? null
}

/**
 * Loads (and on first call creates) the signed-in user's row via the server.
 * Pass `name` right after OTP verification so it is stored on first sign-up.
 * Returns null when there is no valid session.
 */
export async function fetchMe(name?: string): Promise<UserRecord | null> {
  const res = await authedFetch('/api/me', {
    method: 'POST',
    body: JSON.stringify({ name: name ?? '' }),
  })
  if (res.status === 401) return null
  if (!res.ok) throw new Error('Could not load your account.')
  const data = await res.json()
  return data.user as UserRecord
}

export async function signOut() {
  await supabase.auth.signOut()
  clearLocalIdentity()
}

export const TRIAL_PLANS = 5
export const FREE_MONTHLY_PLANS = 1

export type PlanAccess = 'full' | 'limited'

export type Usage = {
  isPremium: boolean
  trialUsed: number
  trialLeft: number
  /** Can the user start a plan right now? (The server makes the final call.) */
  canGenerate: boolean
  /** Access level the NEXT plan would have. */
  nextAccess: PlanAccess
}

/** Friendly client-side read of the user's quota. The server enforces the real limits. */
export function getUsage(user: UserRecord): Usage {
  const isPremium = user.tier === 'pro_monthly' || user.tier === 'pro_annual'
  const trialUsed = Math.min(user.trial_plans_used ?? 0, TRIAL_PLANS)
  const trialLeft = TRIAL_PLANS - trialUsed

  if (isPremium) return { isPremium, trialUsed, trialLeft, canGenerate: true, nextAccess: 'full' }

  // Legacy one-time "single" purchase
  if (user.tier === 'single' && user.single_plans_remaining > 0) {
    return { isPremium: false, trialUsed, trialLeft, canGenerate: true, nextAccess: 'full' }
  }

  if (trialLeft > 0) return { isPremium: false, trialUsed, trialLeft, canGenerate: true, nextAccess: 'full' }

  const sameMonth = user.free_plans_reset_month === currentMonthKey()
  const monthlyUsed = sameMonth ? (user.monthly_plans_used ?? 0) : 0
  return {
    isPremium: false,
    trialUsed,
    trialLeft: 0,
    canGenerate: monthlyUsed < FREE_MONTHLY_PLANS,
    nextAccess: 'limited',
  }
}

type SavedPlanRow = {
  id: string
  title: string
  city: string
  occasion: string
  plan: DatePlan
  form_data: PlanFormData
  created_at: string
}

function rowToSavedPlan(row: SavedPlanRow): SavedPlan {
  return {
    id: row.id,
    title: row.title,
    city: row.city,
    occasion: row.occasion,
    dateSaved: new Date(row.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    plan: row.plan,
    formData: row.form_data,
  }
}

export async function getSavedPlans(email: string): Promise<SavedPlan[]> {
  const { data, error } = await supabase
    .from('saved_plans')
    .select('*')
    .eq('user_email', email.toLowerCase())
    .order('created_at', { ascending: false })

  if (error) throw new Error('Failed to load saved plans: ' + error.message)
  return (data || []).map(rowToSavedPlan)
}

export async function saveDatePlan(
  email: string,
  plan: DatePlan,
  formData: PlanFormData
): Promise<SavedPlan> {
  const { data, error } = await supabase
    .from('saved_plans')
    .insert({
      user_email: email.toLowerCase(),
      title: plan.title,
      city: formData.city,
      occasion: formData.occasion,
      plan,
      form_data: formData,
    })
    .select()
    .single()

  if (error) throw new Error('Failed to save plan: ' + error.message)
  return rowToSavedPlan(data)
}

export async function deleteSavedPlan(id: string, email: string): Promise<void> {
  const { error } = await supabase
    .from('saved_plans')
    .delete()
    .eq('id', id)
    .eq('user_email', email.toLowerCase())

  if (error) throw new Error('Failed to delete plan: ' + error.message)
}