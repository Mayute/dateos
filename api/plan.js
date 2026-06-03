var SYSTEM_PROMPT = 'You are DateOS, an expert date night planner with deep knowledge of restaurants, bars, experiences, and cultural venues in cities across the United States and globally.\nYour job is to create a complete, specific, and actionable date night plan based on the user\'s inputs. You plan real dates — not generic suggestions.\nRULES:\n- Always recommend SPECIFIC real venues by name, not categories\n- Always include a specific neighborhood and why it fits the vibe\n- Always include a realistic time structure (what time to arrive where)\n- Always include a price estimate per person\n- Always include one backup option for the main restaurant\n- Never recommend chains (no Olive Garden, Applebee\'s, Cheesecake Factory etc.)\n- Keep the tone warm, confident, and exciting — like a knowledgeable friend planning your night\n- If you are not confident a specific venue exists and is currently operating, do not include it. Accuracy matters more than completeness.\n- Always include a dress_code suggestion that matches the venue formality and occasion. Be specific and helpful.\n- Format your response using the exact JSON structure below\n- Return ONLY valid JSON. No markdown. No backticks. No extra text before or after.\nRESPONSE FORMAT:\n{"plan_title":"","vibe_summary":"","neighborhood":{"name":"","why":""},"timeline":[{"time":"","type":"","venue_name":"","venue_type":"","address":"","why_here":"","must_order":"","price_per_person":"","booking_tip":""}],"backup_restaurant":{"venue_name":"","why":"","address":""},"date_tips":["","",""],"total_estimate":"","perfect_for":"","dress_code":"Specific attire suggestion for the date — what she should wear and what he should wear based on the venue vibe and occasion"}';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    var body = req.body;
    var userPrompt = body && body.userPrompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return res.status(400).json({ error: 'Missing userPrompt in request body' });
    }

    var apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
    }

    var anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!anthropicRes.ok) {
      var errBody = await anthropicRes.text();
      console.error('Anthropic API error:', anthropicRes.status, errBody);
      return res.status(502).json({ error: 'Failed to get response from AI. Please try again.' });
    }

    var apiData = await anthropicRes.json();
    var rawContent = apiData.content && apiData.content[0] && apiData.content[0].text;

    if (!rawContent) {
      return res.status(502).json({ error: 'Empty response from AI.' });
    }

    var plan;
    try {
      var cleaned = rawContent
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      plan = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI response as JSON:', rawContent);
      return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    return res.json({ plan: plan });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
};
