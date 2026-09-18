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
  is_paid: boolean
  free_plans_reset_month: string | null
  single_plans_remaining: number
}

const SESSION_KEY = 'dateos_user_email'
const NAME_KEY = 'dateos_user_name'

export function getStoredEmail(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function setStoredEmail(email: string) {
  localStorage.setItem(SESSION_KEY, email)
}

export function getStoredName(): string | null {
  return localStorage.getItem(NAME_KEY)
}

export function setStoredName(name: string) {
  localStorage.setItem(NAME_KEY, name)
}

function currentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}`
}

/**
 * Creates or fetches a user row AFTER OTP verification has already succeeded.
 * This should only ever be called post-verifyOtp — never from a raw email input —
 * otherwise the fake-email gap this was built to close reopens.
 */
export async function getOrCreateVerifiedUser(email: string, name: string): Promise<UserRecord> {
  const normalizedEmail = email.toLowerCase()

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('email', normalizedEmail)
    .single()

  if (existing) {
    // Backfill name / verification status if this row predates the OTP flow
    if (!existing.name || !existing.email_verified) {
      const { data: updated } = await supabase
        .from('users')
        .update({ name: existing.name || name, email_verified: true })
        .eq('email', normalizedEmail)
        .select()
        .single()
      return updated || existing
    }
    return existing
  }

  const { data: created, error } = await supabase
    .from('users')
    .insert({ email: normalizedEmail, name, email_verified: true })
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