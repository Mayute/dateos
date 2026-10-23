import { admin as supabase, getAuthedUser } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { rating, comment, plan_title } = req.body ?? {};

  if (rating !== 'up' && rating !== 'down') return res.status(400).json({ error: 'Rating required' });

  // Email comes from the verified session, not from the request body.
  const authed = await getAuthedUser(req);

  const { error } = await supabase
    .from('feedback')
    .insert({
      email: authed?.email ?? null,
      rating,
      comment: typeof comment === 'string' ? comment.slice(0, 2000) : null,
      plan_title: typeof plan_title === 'string' ? plan_title.slice(0, 200) : null,
    });

  if (error) {
    console.error('Feedback error:', error);
    return res.status(500).json({ error: 'Failed to save feedback' });
  }

  return res.status(200).json({ success: true });
}