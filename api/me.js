import { admin, getAuthedUser } from './_lib/auth.js';

// GET  /api/me            -> returns the signed-in user's row (creates it on first call)
// POST /api/me {name}     -> same, and stores the name if the row has none
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  const authed = await getAuthedUser(req);
  if (!authed) return res.status(401).json({ error: 'Please sign in.' });

  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 80) : '';

  try {
    const { data: existing, error: readErr } = await admin
      .from('users')
      .select('*')
      .eq('email', authed.email)
      .maybeSingle();
    if (readErr) throw readErr;

    if (existing) {
      const patch = {};
      if (!existing.email_verified) patch.email_verified = true;
      if (!existing.name && name) patch.name = name;
      if (Object.keys(patch).length === 0) return res.json({ user: existing });

      const { data: updated, error: updErr } = await admin
        .from('users')
        .update(patch)
        .eq('email', authed.email)
        .select()
        .single();
      if (updErr) throw updErr;
      return res.json({ user: updated });
    }

    const { data: created, error: insErr } = await admin
      .from('users')
      .insert({ email: authed.email, name: name || null, email_verified: true })
      .select()
      .single();
    if (insErr) throw insErr;
    return res.json({ user: created });
  } catch (err) {
    console.error('/api/me error:', err);
    return res.status(500).json({ error: 'Could not load your account.' });
  }
}