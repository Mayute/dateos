import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trash2, ChevronDown, ChevronUp, Heart, MapPin, Clock, BookHeart } from 'lucide-react';
import { SavedPlan, DatePlan } from '../types';

export default function SavedPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('dateos_saved');
    if (raw) {
      try { setPlans(JSON.parse(raw)); } catch { setPlans([]); }
    }
  }, []);

  const deletePlan = (id: string) => {
    const updated = plans.filter(p => p.id !== id);
    setPlans(updated);
    localStorage.setItem('dateos_saved', JSON.stringify(updated));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0c0c10' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40" style={{ background: 'rgba(12,12,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
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
          <span className="font-serif text-xl font-medium" style={{ color: '#f0ede8' }}>DateOS</span>
          <button
            onClick={() => navigate('/plan')}
            className="btn-rose flex items-center gap-2 text-sm px-5 py-2.5"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            New Plan
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <BookHeart size={20} style={{ color: '#e8556a' }} />
            <h1 className="font-serif text-4xl md:text-5xl font-medium" style={{ color: '#f0ede8' }}>
              Saved Plans
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'rgba(240,237,232,0.45)', fontFamily: 'Outfit, sans-serif' }}>
            {plans.length > 0 ? `${plans.length} date night${plans.length === 1 ? '' : 's'} saved` : 'Your saved date plans will appear here'}
          </p>
        </div>

        {plans.length === 0 ? (
          <EmptyState onPlan={() => navigate('/plan')} />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {plans.map(plan => (
              <SavedCard
                key={plan.id}
                plan={plan}
                expanded={expandedId === plan.id}
                onToggle={() => toggleExpand(plan.id)}
                onDelete={() => deletePlan(plan.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SavedCard({ plan, expanded, onToggle, onDelete }: {
  plan: SavedPlan;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: '#13131a', border: `1px solid ${expanded ? 'rgba(232,85,106,0.25)' : 'rgba(240,237,232,0.07)'}` }}>
      {/* Card header */}
      <div className="px-6 py-5 flex items-center gap-4">
        <button className="flex-1 text-left" onClick={onToggle}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-serif text-xl font-medium mb-1 truncate" style={{ color: '#f0ede8' }}>{plan.title}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(240,237,232,0.4)' }}>
                  <MapPin size={10} />
                  {plan.city}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(232,85,106,0.1)', border: '1px solid rgba(232,85,106,0.2)', color: '#e8556a' }}>
                  {plan.occasion}
                </span>
                <span className="text-xs" style={{ color: 'rgba(240,237,232,0.3)' }}>{plan.dateSaved}</span>
              </div>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
            style={{ color: 'rgba(240,237,232,0.3)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e8556a'; e.currentTarget.style.background = 'rgba(232,85,106,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,237,232,0.3)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onToggle}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
            style={{ color: 'rgba(240,237,232,0.4)', background: 'rgba(240,237,232,0.05)' }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded plan detail */}
      {expanded && (
        <div className="animate-fade-in" style={{ borderTop: '1px solid rgba(240,237,232,0.06)' }}>
          <ExpandedPlan plan={plan.plan} />
        </div>
      )}
    </div>
  );
}

function ExpandedPlan({ plan }: { plan: DatePlan }) {
  return (
    <div className="px-6 py-6 space-y-6">
      {/* Vibe summary */}
      <p className="font-serif text-base italic" style={{ color: 'rgba(240,237,232,0.5)' }}>
        {plan.vibeSummary}
      </p>

      {/* Neighborhood */}
      <div className="px-4 py-4 rounded-xl" style={{ background: 'rgba(240,237,232,0.03)', border: '1px solid rgba(240,237,232,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={12} style={{ color: '#e8556a' }} />
          <span className="text-xs font-medium" style={{ color: 'rgba(240,237,232,0.4)' }}>Neighborhood</span>
        </div>
        <p className="font-serif text-lg font-medium mb-1" style={{ color: '#f0ede8' }}>{plan.neighborhood.name}</p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,237,232,0.5)' }}>{plan.neighborhood.whyThisNeighborhood}</p>
      </div>

      {/* Timeline compact */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={12} style={{ color: '#e8556a' }} />
          <span className="text-xs font-medium tracking-wider uppercase" style={{ color: 'rgba(240,237,232,0.35)' }}>Evening Timeline</span>
        </div>
        <div className="space-y-2">
          {plan.timeline.map((stop, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(240,237,232,0.03)', border: '1px solid rgba(240,237,232,0.05)' }}>
              <span className="time-badge flex-shrink-0 text-xs">{stop.time}</span>
              <div className="min-w-0">
                <p className="font-medium text-sm" style={{ color: '#f0ede8' }}>{stop.venueName}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(240,237,232,0.4)' }}>{stop.venueType} · {stop.pricePerPerson}</p>
                {stop.mustOrder && (
                  <p className="text-xs mt-1 gold-highlight">Must order: {stop.mustOrder}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date tips */}
      {plan.dateTips && plan.dateTips.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart size={12} fill="#e8556a" style={{ color: '#e8556a' }} />
            <span className="text-xs font-medium tracking-wider uppercase" style={{ color: 'rgba(240,237,232,0.35)' }}>Date Tips</span>
          </div>
          <div className="space-y-2">
            {plan.dateTips.map((tip, i) => (
              <p key={i} className="text-sm leading-relaxed pl-2" style={{ color: 'rgba(240,237,232,0.55)', borderLeft: '2px solid rgba(232,85,106,0.3)', paddingLeft: '12px' }}>{tip}</p>
            ))}
          </div>
        </div>
      )}

      {/* Total cost */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}>
        <span className="text-sm" style={{ color: 'rgba(240,237,232,0.5)' }}>Estimated total per person</span>
        <span className="font-serif text-xl font-medium gold-highlight">{plan.totalCostEstimate}</span>
      </div>
    </div>
  );
}

function EmptyState({ onPlan }: { onPlan: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'rgba(232,85,106,0.1)', border: '1px solid rgba(232,85,106,0.2)' }}>
        <BookHeart size={28} style={{ color: '#e8556a' }} />
      </div>
      <h3 className="font-serif text-2xl font-medium mb-3" style={{ color: '#f0ede8' }}>No saved plans yet</h3>
      <p className="text-sm mb-8 max-w-xs" style={{ color: 'rgba(240,237,232,0.4)', lineHeight: '1.6' }}>
        Plan your first date night and save it here to revisit any time.
      </p>
      <button
        onClick={onPlan}
        className="btn-rose flex items-center gap-2 text-sm"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        Plan a Date Night
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
