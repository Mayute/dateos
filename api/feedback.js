import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, rating, comment, plan_title } = req.body;

  if (!rating) return res.status(400).json({ error: 'Rating required' });

  const { error } = await supabase
    .from('feedback')
    .insert({ email, rating, comment, plan_title });

  if (error) {
    console.error('Feedback error:', error);
    return res.status(500).json({ error: 'Failed to save feedback' });
  }

  return res.status(200).json({ success: true });
}