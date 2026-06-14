import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trash2, ChevronDown, ChevronUp, Heart, MapPin, Clock, BookHeart, Share2, Check, Star, Shirt } from 'lucide-react';
import { SavedPlan, DatePlan } from '../types';
import Footer from '../components/Footer';

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
    <div className="min-h-screen flex flex-col" style={{ background: '#0c0c10' }}>
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
          <span className="font-serif text-xl font-medium"><span style={{ color: '#f0ede8' }}>Date</span><span style={{ color: '#e8556a' }}>OS</span></span>
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

      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
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

      <Footer />
    </div>
  );
}

function SavedCard({ plan, expanded, onToggle, onDelete }: {
  plan: SavedPlan;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = 'https://dateos.io';
    navigator.clipboard.writeText(url).then(() => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      setCopied(true);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: '#13131a', border: `1px solid ${expanded ? 'rgba(232,85,106,0.25)' : 'rgba(240,237,232,0.07)'}` }}>
      <div className="px-6 py-5 flex items-center gap-4">
        <button className="flex-1 text-left" onClick={onToggle}>
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
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleShare}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
            style={{ color: copied ? '#c9a84c' : 'rgba(240,237,232,0.3)', background: 'transparent' }}
            onMouseEnter={e => { if (!copied) { e.currentTarget.style.color = '#f0ede8'; e.currentTarget.style.background = 'rgba(240,237,232,0.06)'; }}}
            onMouseLeave={e => { if (!copied) { e.currentTarget.style.color = 'rgba(240,237,232,0.3)'; e.currentTarget.style.background = 'transparent'; }}}
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
          </button>
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

      {expanded && (
        <div className="animate-fade-in" style={{ borderTop: '1px solid rgba(240,237,232,0.06)' }}>
          <ExpandedPlan plan={plan.plan} />
        </div>
      )}
    </div>
  );
}

function ExpandedPlan({ plan }: { plan: DatePlan }) {
  const [backupOpen, setBackupOpen] = useState(false);

  return (
    <div className="px-6 py-6 space-y-6">
      <p className="font-serif text-base italic" style={{ color: 'rgba(240,237,232,0.5)' }}>
        {plan.vibeSummary}
      </p>

      <div className="px-4 py-4 rounded-xl" style={{ background: 'rgba(240,237,232,0.03)', border: '1px solid rgba(240,237,232,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={12} style={{ color: '#e8556a' }} />
          <span className="text-xs font-medium" style={{ color: 'rgba(240,237,232,0.4)' }}>Neighborhood</span>
        </div>
        <p className="font-serif text-lg font-medium mb-1" style={{ color: '#f0ede8' }}>{plan.neighborhood.name}</p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,237,232,0.5)' }}>{plan.neighborhood.whyThisNeighborhood}</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={12} style={{ color: '#e8556a' }} />
          <span className="text-xs font-medium tracking-wider uppercase" style={{ color: 'rgba(240,237,232,0.35)' }}>Evening Timeline</span>
        </div>
        <div className="space-y-3">
          {plan.timeline.map((stop, i) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(240,237,232,0.03)', border: '1px solid rgba(240,237,232,0.06)' }}>
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: 'rgba(232,85,106,0.12)', border: '1px solid rgba(232,85,106,0.2)', color: '#e8556a' }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="time-badge text-xs">{stop.time}</span>
                    <p className="font-medium text-sm" style={{ color: '#f0ede8' }}>{stop.venueName}</p>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(240,237,232,0.4)' }}>{stop.venueType}</p>
                </div>
              </div>
              <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(240,237,232,0.05)' }}>
              {stop.address && (
                <a
  
  href={`https://maps.google.com/?q=${encodeURIComponent(stop.address)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-xs pt-3 flex items-center gap-1.5"
  style={{ color: 'rgba(240,237,232,0.85)', textDecoration: 'underline', textDecorationColor: 'rgba(240,237,232,0.3)', textUnderlineOffset: '2px' }}
>
  <MapPin size={10} />
  {stop.address}
</a>
)}
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,237,232,0.6)' }}>
                  <span className="font-medium" style={{ color: 'rgba(240,237,232,0.8)' }}>Why here: </span>
                  {stop.whyHere}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="px-3 py-2.5 rounded-lg"
                    style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}>
                    <p className="text-xs mb-1" style={{ color: 'rgba(201,168,76,0.6)', fontWeight: 500 }}>Must order</p>
                    <p className="text-xs gold-highlight">{stop.mustOrder}</p>
                  </div>
                  <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(240,237,232,0.04)', border: '1px solid rgba(240,237,232,0.07)' }}>
                    <p className="text-xs mb-1" style={{ color: 'rgba(240,237,232,0.35)', fontWeight: 500 }}>Per person</p>
                    <p className="text-xs" style={{ color: '#f0ede8' }}>{stop.pricePerPerson}</p>
                  </div>
                  <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(240,237,232,0.04)', border: '1px solid rgba(240,237,232,0.07)' }}>
                    <p className="text-xs mb-1" style={{ color: 'rgba(240,237,232,0.35)', fontWeight: 500 }}>Booking tip</p>
                    <p className="text-xs" style={{ color: '#f0ede8' }}>{stop.bookingTip}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {plan.backupOption?.venueName && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(240,237,232,0.03)', border: '1px solid rgba(240,237,232,0.06)' }}>
          <button
            className="w-full px-4 py-3 flex items-center justify-between"
            onClick={() => setBackupOpen(p => !p)}
          >
            <div className="flex items-center gap-2">
              <Star size={13} style={{ color: '#c9a84c' }} />
              <span className="font-medium text-sm" style={{ color: '#f0ede8' }}>Backup Option</span>
            </div>
            {backupOpen ? <ChevronUp size={15} style={{ color: 'rgba(240,237,232,0.4)' }} /> : <ChevronDown size={15} style={{ color: 'rgba(240,237,232,0.4)' }} />}
          </button>
          {backupOpen && (
            <div className="px-4 pb-4 animate-fade-in" style={{ borderTop: '1px solid rgba(240,237,232,0.05)' }}>
              <p className="font-serif text-base font-medium mt-3 mb-0.5" style={{ color: '#f0ede8' }}>{plan.backupOption.venueName}</p>
              {plan.backupOption.venueType && (
                <p className="text-xs mb-1" style={{ color: 'rgba(240,237,232,0.4)' }}>{plan.backupOption.venueType}</p>
              )}
              {plan.backupOption.address && (
  <a
  href={`https://maps.google.com/?q=${encodeURIComponent(plan.backupOption.address)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-xs mb-2 flex items-center gap-1.5"
  style={{ color: 'rgba(240,237,232,0.85)', textDecoration: 'underline', textDecorationColor: 'rgba(240,237,232,0.3)', textUnderlineOffset: '2px' }}
>
  <MapPin size={10} />
  {plan.backupOption.address}
</a>
)}
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,237,232,0.6)' }}>{plan.backupOption.whyItWorks}</p>
            </div>
          )}
        </div>
      )}

      {plan.dressCode && (
        <div className="px-4 py-4 rounded-xl" style={{ background: 'rgba(240,237,232,0.03)', border: '1px solid rgba(240,237,232,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Shirt size={12} style={{ color: '#e8556a' }} />
          <span className="text-xs font-medium tracking-wider uppercase" style={{ color: 'rgba(240,237,232,0.35)' }}>What to Wear</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,237,232,0.65)' }}>{plan.dressCode}</p>
      </div>
      )}

      {plan.dateTips && plan.dateTips.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart size={12} fill="#e8556a" style={{ color: '#e8556a' }} />
            <span className="text-xs font-medium tracking-wider uppercase" style={{ color: 'rgba(240,237,232,0.35)' }}>Date Tips</span>
          </div>
          <div className="space-y-2">
            {plan.dateTips.map((tip, i) => (
              <p key={i} className="text-sm leading-relaxed"
                style={{ color: 'rgba(240,237,232,0.55)', borderLeft: '2px solid rgba(232,85,106,0.3)', paddingLeft: '12px' }}>
                {tip}
              </p>
            ))}
          </div>
        </div>
      )}

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