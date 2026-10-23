import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { PlanFormData, DatePlan } from '../types';
import Logo from '../components/logo';
import PaywallModal from '../components/PaywallModal';
import EmailGate from '../components/EmailGate';
import {
  authedFetch,
  fetchMe,
  getUsage,
  TRIAL_PLANS,
  type UserRecord
} from '../lib/userStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePlan(raw: any): DatePlan {
  return {
    title: raw.plan_title ?? raw.title ?? '',
    vibeSummary: raw.vibe_summary ?? raw.vibeSummary ?? '',
    neighborhood: {
      name: raw.neighborhood?.name ?? '',
      whyThisNeighborhood: raw.neighborhood?.why ?? raw.neighborhood?.whyThisNeighborhood ?? '',
    },
    timeline: (raw.timeline ?? []).map((s: any) => ({
      time: s.time ?? '',
      venueName: s.venue_name ?? s.venueName ?? '',
      venueType: s.venue_type ?? s.venueType ?? '',
      address: s.address ?? '',
      whyHere: s.why_here ?? s.whyHere ?? '',
      mustOrder: s.must_order ?? s.mustOrder ?? '',
      pricePerPerson: s.price_per_person ?? s.pricePerPerson ?? '',
      bookingTip: s.booking_tip ?? s.bookingTip ?? '',
    })),
    backupOption: {
      venueName: raw.backup_restaurant?.venue_name ?? raw.backupOption?.venueName ?? '',
      venueType: raw.backup_restaurant?.type ?? raw.backupOption?.venueType ?? '',
      address: raw.backup_restaurant?.address ?? raw.backupOption?.address ?? '',
      whyItWorks: raw.backup_restaurant?.why ?? raw.backupOption?.whyItWorks ?? '',
    },
    dateTips: raw.date_tips ?? raw.dateTips ?? [],
    totalCostEstimate: raw.total_estimate ?? raw.totalCostEstimate ?? '',
    dressCode: raw.dress_code ?? raw.dressCode ?? '',
  };
}

const VIBES = ['Romantic', 'Adventurous', 'Cozy', 'Upscale', 'Casual', 'Artsy', 'Foodie'];

const OCCASIONS = [
  { value: 'First Date', label: 'First Date' },
  { value: 'Anniversary', label: 'Anniversary' },
  { value: 'Birthday', label: 'Birthday' },
  { value: 'Just Because', label: 'Just Because' },
  { value: 'Special Surprise', label: 'Special Surprise' },
];

const BUDGETS = [
  { value: 'Under $50', label: 'Under $50' },
  { value: '$50–$100', label: '$50–$100' },
  { value: '$100–$150', label: '$100–$150' },
  { value: '$150+', label: '$150+' },
];

const DAYTIMES = [
  { value: 'Tonight', label: 'Tonight' },
  { value: 'This Weekend', label: 'This Weekend' },
  { value: 'Saturday Night', label: 'Saturday Night' },
  { value: 'Sunday Brunch', label: 'Sunday Brunch' },
];

const EXPERIENCE_TYPES = [
  {
    value: 'Dining & Drinks',
    label: 'Dining & Drinks',
    guidance: 'Focus on restaurants, bars, and culinary experiences — a classic dinner-and-drinks flow.',
  },
  {
    value: 'Arts & Culture',
    label: 'Arts & Culture',
    guidance: 'Prioritize museums, galleries, theaters, or cultural landmarks alongside food.',
  },
  {
    value: 'Outdoor & Active',
    label: 'Outdoor & Active',
    guidance: 'Prioritize outdoor or active experiences — parks, scenic walks, rooftops, or activity-based venues — paired with food.',
  },
  {
    value: 'Live Entertainment',
    label: 'Live Entertainment',
    guidance: 'Center the plan around a live entertainment experience — concerts, comedy shows, or live music venues — paired with food.',
  },
  {
    value: 'Hidden Gems',
    label: 'Hidden Gems',
    guidance: 'Prioritize under-the-radar, lesser-known local spots over popular or touristy ones — the kind of places locals actually go.',
  },
  {
    value: 'Mix it all',
    label: 'Mix it all',
    guidance: 'Blend multiple experience types across the evening — combine dining with something cultural, active, or entertainment-based for variety.',
  },
];

export default function PlannerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const usage = userRecord ? getUsage(userRecord) : null;

  const [form, setForm] = useState<PlanFormData>({
    city: '',
    occasion: '',
    experienceType: EXPERIENCE_TYPES[0].value,
    vibes: [],
    budget: '',
    dayTime: '',
    dietary: '',
    avoid: '',
    whoIsThisFor: '',
  });

  // Ask the server who we are. No valid session (or an old localStorage-only login) -> show the gate.
  useEffect(() => {
    let active = true;
    fetchMe()
      .then(u => {
        if (!active) return;
        if (u) {
          setUserRecord(u);
          setShowEmailGate(false);
        } else {
          setShowEmailGate(true);
        }
      })
      .catch(() => { if (active) setShowEmailGate(true); });
    setShowPaywall(false);
    return () => { active = false; };
  }, []);

  function handleEmailAuthenticated() {
    setShowEmailGate(false);
    fetchMe().then(u => { if (u) setUserRecord(u); });
  }

  const toggleVibe = (vibe: string) => {
    setForm(prev => {
      if (prev.vibes.includes(vibe)) {
        return { ...prev, vibes: prev.vibes.filter(v => v !== vibe) };
      }
      if (prev.vibes.length >= 2) return prev;
      return { ...prev, vibes: [...prev.vibes, vibe] };
    });
  };

  const buildUserPrompt = (f: PlanFormData) => {
    const experienceType = EXPERIENCE_TYPES.find(e => e.value === f.experienceType) ?? EXPERIENCE_TYPES[0];
    return `Plan a date night with these details:
- City: ${f.city}
- Occasion: ${f.occasion}
- Experience type: ${experienceType.value} — ${experienceType.guidance}
- Vibe: ${f.vibes.join(', ')}
- Budget per person: ${f.budget}
- When: ${f.dayTime}
- Planning for: ${f.whoIsThisFor}${f.dietary ? `\n- Dietary needs: ${f.dietary}` : ''}${f.avoid ? `\n- Avoid: ${f.avoid}` : ''}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city || !form.occasion || form.vibes.length === 0 || !form.budget || !form.dayTime || !form.whoIsThisFor) {
      setError('Please fill in all required fields and select at least one vibe.');
      return;
    }
    setError('');

    if (!userRecord) {
      setShowEmailGate(true);
      return;
    }

    // Friendly pre-check using a fresh copy from the server. The server enforces the limit for real.
    const freshUser = await fetchMe().catch(() => null);
    if (!freshUser) {
      setShowEmailGate(true);
      return;
    }
    setUserRecord(freshUser);
    if (!getUsage(freshUser).canGenerate) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);

    try {
      const userPrompt = buildUserPrompt(form);
      const res = await authedFetch('/api/plan', {
        method: 'POST',
        body: JSON.stringify({ userPrompt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 402 || data.code === 'LIMIT') {
          setShowPaywall(true);
          return;
        }
        if (res.status === 401 || data.code === 'AUTH') {
          setShowEmailGate(true);
          return;
        }
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      const data = await res.json();
      if (!data.plan) {
        throw new Error(`API returned no plan. Raw response: ${JSON.stringify(data)}`);
      }

      const plan = normalizePlan(data.plan);
      if (data.user) setUserRecord(data.user as UserRecord);
      const after = data.user ? getUsage(data.user as UserRecord) : null;
      sessionStorage.setItem('dateos_result', JSON.stringify({
        plan,
        formData: form,
        access: data.access === 'limited' ? 'limited' : 'full',
        quota: after ? { isPremium: after.isPremium, trialUsed: after.trialUsed, trialLeft: after.trialLeft } : null,
      }));
      navigate('/result');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showEmailGate && <EmailGate onAuthenticated={handleEmailAuthenticated} />}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} title="You've used this month's free plan" subtitle="Go Premium for unlimited plans, What to Wear, Date Tips and saved plans." />}
      {loading && <LoadingOverlay />}

      <div className="min-h-screen" style={{ background: '#0c0c10' }}>
        <div className="sticky top-0 z-40" style={{ background: 'rgba(12,12,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
          <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm transition-colors duration-200"
              style={{ color: 'rgba(240,237,232,0.5)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f0ede8')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.5)')}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="flex items-center gap-2">
              <Logo />
            </div>
            <div className="w-16" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="font-serif text-4xl md:text-5xl font-medium mb-3" style={{ color: '#f0ede8' }}>
              Plan your date
            </h1>
            <p className="text-sm" style={{ color: 'rgba(240,237,232,0.45)', fontFamily: 'Outfit, sans-serif' }}>
              Fill in the details and our AI will craft your perfect evening.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="label-field">City *</label>
              <input
                className="input-dark"
                type="text"
                placeholder="New York, Chicago, Miami, Los Angeles..."
                value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
              />
            </div>

            <div>
              <label className="label-field">Occasion *</label>
              <select
                className="input-dark appearance-none"
                value={form.occasion}
                onChange={e => setForm(p => ({ ...p, occasion: e.target.value }))}
                style={{ cursor: 'pointer' }}
              >
                <option value="" disabled style={{ background: '#13131a' }}>Select an occasion...</option>
                {OCCASIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: '#13131a' }}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">Experience Type</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {EXPERIENCE_TYPES.map(et => (
                  <button
                    key={et.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, experienceType: et.value }))}
                    className={`chip-vibe ${form.experienceType === et.value ? 'active' : ''}`}
                  >
                    {et.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-field">Vibe * <span style={{ color: 'rgba(240,237,232,0.35)', textTransform: 'none', letterSpacing: 'normal', fontSize: '0.7rem' }}>pick up to 2</span></label>
              <div className="flex flex-wrap gap-2 mt-1">
                {VIBES.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleVibe(v)}
                    className={`chip-vibe ${form.vibes.includes(v) ? 'active' : ''}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label-field">Budget per person *</label>
                <select
                  className="input-dark appearance-none"
                  value={form.budget}
                  onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="" disabled style={{ background: '#13131a' }}>Select budget...</option>
                  {BUDGETS.map(b => (
                    <option key={b.value} value={b.value} style={{ background: '#13131a' }}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">Day & Time *</label>
                <select
                  className="input-dark appearance-none"
                  value={form.dayTime}
                  onChange={e => setForm(p => ({ ...p, dayTime: e.target.value }))}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="" disabled style={{ background: '#13131a' }}>Select when...</option>
                  {DAYTIMES.map(d => (
                    <option key={d.value} value={d.value} style={{ background: '#13131a' }}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6 pt-2">
            <div>
  <label className="label-field">Who's this for? *</label>
  <div className="flex flex-wrap gap-2 mt-1">
    {['Just Me', 'My Partner', 'Friends'].map(option => (
      <button
        key={option}
        type="button"
        onClick={() => setForm(p => ({ ...p, whoIsThisFor: option }))}
        className={`chip-vibe ${form.whoIsThisFor === option ? 'active' : ''}`}
      >
        {option}
      </button>
    ))}
  </div>
</div>
              <div style={{ borderTop: '1px solid rgba(240,237,232,0.06)', paddingTop: '1.5rem' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-medium tracking-wider uppercase" style={{ color: 'rgba(240,237,232,0.3)' }}>Optional extras</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(240,237,232,0.06)' }} />
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="label-field">Dietary needs</label>
                    <input
                      className="input-dark"
                      type="text"
                      placeholder="vegetarian, gluten-free, halal, nut allergy..."
                      value={form.dietary}
                      onChange={e => setForm(p => ({ ...p, dietary: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label-field">Anything to avoid</label>
                    <input
                      className="input-dark"
                      type="text"
                      placeholder="loud venues, tourist traps, chain restaurants..."
                      value={form.avoid}
                      onChange={e => setForm(p => ({ ...p, avoid: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(232,85,106,0.1)', border: '1px solid rgba(232,85,106,0.3)', color: '#e8556a' }}>
                {error}
              </div>
            )}

            {usage && !usage.isPremium && (
              <p className="text-center text-sm" style={{ color: 'rgba(240,237,232,0.5)', fontFamily: 'Outfit, sans-serif' }}>
                {usage.trialLeft > 0
                  ? <>
                      <span style={{ color: '#e8556a', fontWeight: 600 }}>{usage.trialLeft} of {TRIAL_PLANS}</span> free plans left
                      {' '}· every feature included
                    </>
                  : usage.canGenerate
                    ? 'Your 1 free itinerary-only plan this month is ready'
                    : "You've used this month's free plan"}
              </p>
            )}

            <button
              type="submit"
              className="btn-rose w-full flex items-center justify-center gap-3 text-base"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Plan My Date
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(12,12,16,0.97)', backdropFilter: 'blur(8px)' }}>
      <div className="relative mb-8">
        <Heart
          size={56}
          className="animate-pulse-rose"
          style={{ color: '#e8556a', fill: '#e8556a', animation: 'pulseRose 1.5s ease-in-out infinite' }}
        />
        <div className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,85,106,0.3) 0%, transparent 70%)', animation: 'pulseRose 1.5s ease-in-out infinite' }} />
      </div>
      <h2 className="font-serif text-2xl font-medium mb-3" style={{ color: '#f0ede8' }}>
        Planning your perfect night...
      </h2>
      <p className="text-sm" style={{ color: 'rgba(240,237,232,0.45)', fontFamily: 'Outfit, sans-serif' }}>
        We're crafting every detail with care
      </p>
      <div className="flex gap-1.5 mt-8">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#e8556a',
              animation: `pulseRose 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
        ))}
      </div>
    </div>
  );
}