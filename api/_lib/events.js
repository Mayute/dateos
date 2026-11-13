// One row per plan attempt, for your own usage stats. Never throws: logging must not break a plan.
// Only the city/occasion/experience/vibe/budget lines are stored, never dietary or "avoid" text.

function field(prompt, label) {
    const m = new RegExp(`^- ${label}: (.+)$`, 'm').exec(prompt || '');
    return m ? m[1].trim().slice(0, 100) : null;
  }
  
  export async function logPlanEvent(admin, { user, userPrompt, access, status }) {
    try {
      const experience = field(userPrompt, 'Experience type');
      const { error } = await admin.from('plan_events').insert({
        email: user.email,
        tier: user.tier ?? null,
        access: access ?? null,
        status,
        city: field(userPrompt, 'City'),
        occasion: field(userPrompt, 'Occasion'),
        experience_type: experience ? experience.split(' — ')[0] : null,
        vibe: field(userPrompt, 'Vibe'),
        budget: field(userPrompt, 'Budget per person'),
      });
      if (error) console.error('plan_events insert failed:', error.message);
    } catch (e) {
      console.error('plan_events insert threw:', e);
    }
  }