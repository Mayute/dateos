import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Heart, MapPin, Clock, ChevronDown, ChevronUp,
  Share2, BookmarkPlus, Check, Star
} from 'lucide-react';
import { DatePlan, PlanFormData, SavedPlan } from '../types';

interface ResultData {
  plan: DatePlan;
  formData: PlanFormData;
}

export default function ResultPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ResultData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [backupOpen, setBackupOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('dateos_result');
    console.log('[DateOS] sessionStorage dateos_result:', raw);
    if (!raw) {
      navigate('/plan');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      console.log('[DateOS] Parsed result data:', parsed);
      if (!parsed.plan) {
        setParseError(`Stored data is missing 'plan' field. Raw: ${raw}`);
        return;
      }
      setData(parsed);
    } catch (e) {
      console.error('[DateOS] Failed to parse sessionStorage:', e);
      setParseError(`Failed to parse stored plan: ${e}. Raw: ${raw}`);
    }
  }, [navigate]);

  if (parseError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0c0c10' }}>
        <div className="max-w-2xl w-full p-6 rounded-2xl" style={{ background: '#13131a', border: '1px solid rgba(232,85,106,0.3)' }}>
          <h2 className="font-serif text-xl font-medium mb-3" style={{ color: '#e8556a' }}>Something went wrong rendering your plan</h2>
          <pre className="text-xs overflow-auto p-4 rounded-xl mb-4 whitespace-pre-wrap" style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(240,237,232,0.6)', maxHeight: '300px' }}>
            {parseError}
          </pre>
          <button onClick={() => navigate('/plan')} className="btn-rose flex items-center gap-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { plan, formData } = data;

  const handleSave = () => {
    const existing: SavedPlan[] = JSON.parse(localStorage.getItem('dateos_saved') || '[]');
    const newSaved: SavedPlan = {
      id: Date.now().toString(),
      title: plan.title,
      city: formData.city,
      occasion: formData.occasion,
      dateSaved: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      plan,
      formData,
    };
    localStorage.setItem('dateos_saved', JSON.stringify([newSaved, ...existing]));
    setSaved(true);
  };

  const handleShare = () => {
    const text = buildShareText(plan, formData);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen" style={{ background: '#0c0c10' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40" style={{ background: 'rgba(12,12,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/plan')}
            className="flex items-center gap-2 text-sm transition-colors duration-200"
            style={{ color: 'rgba(240,237,232,0.5)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f0ede8')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.5)')}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="font-serif text-xl font-medium"><span style={{ color: '#f0ede8' }}>Date</span><span style={{ color: '#e8556a' }}>OS</span></span>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full transition-all duration-200"
            style={{ color: copied ? '#c9a84c' : 'rgba(240,237,232,0.5)', border: '1px solid rgba(240,237,232,0.1)' }}
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6 animate-fade-in">

        {/* Hero header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-medium"
            style={{ background: 'rgba(232,85,106,0.1)', border: '1px solid rgba(232,85,106,0.2)', color: '#e8556a' }}>
            <Heart size={11} fill="#e8556a" />
            {formData.occasion} · {formData.city}
          </div>
          <h1 className="font-serif font-medium leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#f0ede8' }}>
            {plan.title}
          </h1>
          <p className="font-serif text-lg italic max-w-xl mx-auto"
            style={{ color: 'rgba(240,237,232,0.55)', lineHeight: '1.6' }}>
            {plan.vibeSummary}
          </p>
        </div>

        {/* Neighborhood */}
        <SectionCard>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(232,85,106,0.15)', border: '1px solid rgba(232,85,106,0.25)' }}>
              <MapPin size={14} style={{ color: '#e8556a' }} />
            </div>
            <div>
              <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: 'rgba(240,237,232,0.35)' }}>The Neighborhood</p>
              <h2 className="font-serif text-2xl font-medium" style={{ color: '#f0ede8' }}>{plan.neighborhood.name}</h2>
            </div>
          </div>
          <p className="text-sm leading-relaxed pl-11" style={{ color: 'rgba(240,237,232,0.6)' }}>
            {plan.neighborhood.whyThisNeighborhood}
          </p>
        </SectionCard>

        {/* Timeline */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-1">
            <Clock size={14} style={{ color: '#e8556a' }} />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(240,237,232,0.4)' }}>Your Evening</span>
          </div>
          <div className="space-y-3">
            {plan.timeline.map((stop, i) => (
              <TimelineCard key={i} stop={stop} index={i} />
            ))}
          </div>
        </div>

        {/* Backup option */}
        <SectionCard>
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setBackupOpen(p => !p)}
          >
            <div className="flex items-center gap-2">
              <Star size={14} style={{ color: '#c9a84c' }} />
              <span className="font-medium text-sm" style={{ color: '#f0ede8' }}>Backup Option</span>
            </div>
            {backupOpen ? <ChevronUp size={16} style={{ color: 'rgba(240,237,232,0.4)' }} /> : <ChevronDown size={16} style={{ color: 'rgba(240,237,232,0.4)' }} />}
          </button>
          {backupOpen && (
            <div className="mt-4 pt-4 animate-fade-in" style={{ borderTop: '1px solid rgba(240,237,232,0.08)' }}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-serif text-xl font-medium" style={{ color: '#f0ede8' }}>{plan.backupOption.venueName}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(240,237,232,0.4)' }}>{plan.backupOption.venueType}</p>
                </div>
              </div>
              <p className="text-xs mb-2" style={{ color: 'rgba(240,237,232,0.4)' }}>{plan.backupOption.address}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,237,232,0.6)' }}>{plan.backupOption.whyItWorks}</p>
            </div>
          )}
        </SectionCard>

        {/* Date tips */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-4">
            <Heart size={13} fill="#e8556a" style={{ color: '#e8556a' }} />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(240,237,232,0.4)' }}>Date Tips</span>
          </div>
          <div className="space-y-3">
            {plan.dateTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(232,85,106,0.12)', border: '1px solid rgba(232,85,106,0.2)' }}>
                  <Heart size={9} fill="#e8556a" style={{ color: '#e8556a' }} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,237,232,0.65)' }}>{tip}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Total cost */}
        <div className="px-6 py-5 rounded-2xl text-center"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: 'rgba(201,168,76,0.6)' }}>Estimated Total</p>
          <p className="font-serif text-3xl font-medium" style={{ color: '#c9a84c' }}>{plan.totalCostEstimate}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(240,237,232,0.3)' }}>per person, including drinks & tip</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-12">
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-medium text-sm transition-all duration-200"
            style={{
              background: saved ? 'rgba(201,168,76,0.1)' : 'rgba(240,237,232,0.06)',
              border: saved ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(240,237,232,0.1)',
              color: saved ? '#c9a84c' : 'rgba(240,237,232,0.7)',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {saved ? <Check size={16} /> : <BookmarkPlus size={16} />}
            {saved ? 'Saved!' : 'Save This Plan'}
          </button>
          <button
            onClick={() => navigate('/plan')}
            className="btn-rose flex-1 flex items-center justify-center gap-2 py-4"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Plan Another Date
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl" style={{ background: '#13131a', border: '1px solid rgba(240,237,232,0.07)' }}>
      {children}
    </div>
  );
}

function TimelineCard({ stop, index }: { stop: import('../types').TimelineStop; index: number }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: '#13131a', border: '1px solid rgba(240,237,232,0.07)' }}>
      <button
        className="w-full px-6 py-5 flex items-center gap-4 text-left"
        onClick={() => setOpen(p => !p)}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{ background: 'rgba(232,85,106,0.12)', border: '1px solid rgba(232,85,106,0.2)', color: '#e8556a' }}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="time-badge">{stop.time}</span>
            <h3 className="font-serif text-lg font-medium" style={{ color: '#f0ede8' }}>{stop.venueName}</h3>
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(240,237,232,0.4)' }}>{stop.venueType}</p>
        </div>
        {open ? <ChevronUp size={16} style={{ color: 'rgba(240,237,232,0.3)', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: 'rgba(240,237,232,0.3)', flexShrink: 0 }} />}
      </button>

      {open && (
        <div className="px-6 pb-6 animate-fade-in" style={{ borderTop: '1px solid rgba(240,237,232,0.05)' }}>
          <p className="text-xs pt-4 mb-3 flex items-center gap-1.5" style={{ color: 'rgba(240,237,232,0.35)' }}>
            <MapPin size={11} />
            {stop.address}
          </p>

          <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(240,237,232,0.6)' }}>
            <span className="font-medium" style={{ color: 'rgba(240,237,232,0.8)' }}>Why here: </span>
            {stop.whyHere}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(201,168,76,0.6)', fontWeight: 500 }}>Must order</p>
              <p className="text-sm gold-highlight">{stop.mustOrder}</p>
            </div>
            <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(240,237,232,0.04)', border: '1px solid rgba(240,237,232,0.07)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(240,237,232,0.35)', fontWeight: 500 }}>Per person</p>
              <p className="text-sm" style={{ color: '#f0ede8' }}>{stop.pricePerPerson}</p>
            </div>
            <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(240,237,232,0.04)', border: '1px solid rgba(240,237,232,0.07)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(240,237,232,0.35)', fontWeight: 500 }}>Booking tip</p>
              <p className="text-sm" style={{ color: '#f0ede8' }}>{stop.bookingTip}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildShareText(plan: DatePlan, formData: PlanFormData): string {
  const stops = plan.timeline.map(s => `  ${s.time} — ${s.venueName} (${s.venueType})`).join('\n');
  return `✨ ${plan.title}\n${plan.vibeSummary}\n\n📍 ${plan.neighborhood.name}, ${formData.city}\n💰 ${plan.totalCostEstimate} per person\n\n${plan.timeline.length > 0 ? `Timeline:\n${stops}` : ''}\n\nPlanned with DateOS`;
}
