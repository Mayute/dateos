import { createClient } from '@supabase/supabase-js';

// Service-role client: server only. Never import this file from src/.
export const admin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

/**
 * Verifies the Supabase access token sent as `Authorization: Bearer <jwt>`.
 * Returns { email } for a valid, OTP-verified session, otherwise null.
 * The email comes from Supabase's own verification, never from the request body.
 */
export async function getAuthedUser(req) {
  const header = req.headers['authorization'] || req.headers['Authorization'] || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return null;

  const { data, error } = await admin.auth.getUser(match[1]);
  if (error || !data?.user?.email) return null;

  return { email: data.user.email.toLowerCase(), authId: data.user.id };
}