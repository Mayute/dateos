import { admin, getAuthedUser } from './_lib/auth.js';
import { evaluateUsage, stripPremiumFields } from './_lib/limits.js';

const MAX_PROMPT_CHARS = 3000;

const SYSTEM_PROMPT = `You are DateOS, an expert date night planner with deep knowledge of restaurants, bars, experiences, and cultural venues in cities across the United States and globally.
Your job is to create a complete, specific, and actionable date night plan based on the user's inputs. You plan real dates — not generic suggestions.
RULES:
- Always recommend SPECIFIC real venues by name, not categories
- Always include a specific neighborhood and why it fits the vibe
- Always include a realistic time structure (what time to arrive where)
- Always include a price estimate per person
- Always include one backup option for the main restaurant
- Never recommend chains (no Olive Garden, Applebee's, Cheesecake Factory etc.)
- Keep the tone warm, confident, and exciting — like a knowledgeable friend planning your night
- If you are not confident a specific venue exists and is currently operating, do not include it. Accuracy matters more than completeness.
- Format your response using the exact JSON structure below
- Return ONLY valid JSON. No markdown. No backticks. No extra text before or after.
- Always start the dress_code field with the most formal venue name first. Format: '[Venue Name] sets the dress standard for the evening — Him: [what he wears]. Her: [what she wears].'
RESPONSE FORMAT:
{"plan_title":"","vibe_summary":"","neighborhood":{"name":"","why":""},"timeline":[{"time":"","type":"","venue_name":"","venue_type":"","address":"","why_here":"","must_order":"","price_per_person":"","booking_tip":""}],"backup_restaurant":{"venue_name":"","type":"","why":"","address":""},"date_tips":["","",""],"total_estimate":"","dress_code":"","perfect_for":""}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authed = await getAuthedUser(req);
  if (!authed) {
    return res.status(401).json({ error: 'Please sign in to generate a plan.', code: 'AUTH' });
  }

  // Declared outside try so the catch block can refund a reserved plan.
  let reserved = null;

  try {
    const { userPrompt } = req.body ?? {};

    if (!userPrompt || typeof userPrompt !== 'string') {
      return res.status(400).json({ error: 'Missing userPrompt in request body' });
    }
    if (userPrompt.length > MAX_PROMPT_CHARS) {
      return res.status(400).json({ error: 'Request too long.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
    }

    // --- Limit check + reserve the plan BEFORE spending Anthropic credits ---
    const { data: user, error: userErr } = await admin
      .from('users')
      .select('*')
      .eq('email', authed.email)
      .maybeSingle();
    if (userErr) throw userErr;
    if (!user) {
      return res.status(403).json({ error: 'Account not found. Please sign in again.', code: 'AUTH' });
    }

    const usage = evaluateUsage(user);
    if (!usage.allowed) {
      if (usage.reason === 'FAIR_USE') {
        return res.status(429).json({ error: "You've reached this month's fair-use limit. It resets next month.", code: 'FAIR_USE' });
      }
      return res.status(402).json({ error: 'Plan limit reached.', code: 'LIMIT' });
    }

    // Compare-and-swap on plans_generated so two simultaneous requests cannot both spend the same plan.
    const { data: swapped, error: swapErr } = await admin
      .from('users')
      .update(usage.patch)
      .eq('email', authed.email)
      .eq('plans_generated', user.plans_generated)
      .select()
      .maybeSingle();
    if (swapErr) throw swapErr;
    if (!swapped) {
      return res.status(409).json({ error: 'Another plan is already being generated. Please wait a moment and try again.' });
    }
    reserved = { before: user, after: swapped, access: usage.access };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
  'Content-Type': 'application/json',
  'x-api-key': apiKey,
  'anthropic-version': '2023-06-01',
  
},
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      await refund(reserved);
      return res.status(502).json({ error: 'Failed to get response from AI. Please try again.' });
    }

    const apiData = await response.json();
    const rawContent = apiData.content?.find(block => block.type === 'text')?.text;

    if (!rawContent) {
      await refund(reserved);
      return res.status(502).json({ error: 'Empty response from AI.' });
    }

    let plan;
    try {
      const cleaned = rawContent
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      plan = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response as JSON:', rawContent);
      await refund(reserved);
      return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    // Free users on an itinerary-only plan never receive What to Wear or Date Tips.
    const finalPlan = reserved.access === 'limited' ? stripPremiumFields(plan) : plan;
    return res.json({ plan: finalPlan, access: reserved.access, user: reserved.after });
  } catch (err) {
    console.error('Server error:', err);
    await refund(reserved);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}


// Gives the plan back if generation failed after we reserved it.
async function refund(reserved) {
  if (!reserved) return;
  try {
    const { before } = reserved;
    await admin
      .from('users')
      .update({
        plans_generated: before.plans_generated,
        single_plans_remaining: before.single_plans_remaining,
        free_plans_reset_month: before.free_plans_reset_month,
        trial_plans_used: before.trial_plans_used ?? 0,
        monthly_plans_used: before.monthly_plans_used ?? 0,
      })
      .eq('email', before.email);
  } catch (e) {
    console.error('Refund failed:', e);
  }
}