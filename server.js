import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

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
RESPONSE FORMAT:
{"plan_title":"","vibe_summary":"","neighborhood":{"name":"","why":""},"timeline":[{"time":"","type":"","venue_name":"","venue_type":"","address":"","why_here":"","must_order":"","price_per_person":"","booking_tip":""}],"backup_restaurant":{"venue_name":"","why":"","address":""},"date_tips":["","",""],"total_estimate":"","perfect_for":""}`;

app.post('/api/plan', async (req, res) => {
  try {
    const { userPrompt } = req.body;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return res.status(400).json({ error: 'Missing userPrompt in request body' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      return res.status(502).json({ error: 'Failed to get response from AI. Please try again.' });
    }

    const apiData = await response.json();
    const rawContent = apiData.content?.[0]?.text;

    if (!rawContent) {
      return res.status(502).json({ error: 'Empty response from AI.' });
    }

    let plan;
    try {
      // Strip markdown code fences if present
      const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      plan = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response as JSON:', rawContent);
      return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    return res.json({ plan });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`DateOS server running on port ${PORT}`);
});
