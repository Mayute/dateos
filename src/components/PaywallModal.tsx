import { useState, useEffect } from 'react';
import { X, Star, Crown, Check } from 'lucide-react';
import { authedFetch } from '../lib/userStore';

interface Props {
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function PaywallModal({ onClose, title, subtitle }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [waitlistState, setWaitlistState] = useState<'idle' | 'sending' | 'done'>('idle');

  useEffect(() => {
    setLoading(null);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') setLoading(null);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  async function handlePlanSelect(plan: 'pro_monthly' | 'pro_annual') {
    setLoading(plan);
    try {
      const res = await authedFetch('/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 503 || data.code === 'PAYMENTS_UNAVAILABLE') {
        setLoading(null);
        setUnavailable(true);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL');
      }
    } catch {
      setLoading(null);
      alert('Something went wrong. Please try again.');
    }
  }

  async function joinWaitlist() {
    setWaitlistState('sending');
    try {
      // Signed-in users are already identified by the server, so this records their email.
      await authedFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({ rating: 'up', comment: 'PREMIUM_WAITLIST', plan_title: 'paywall' }),
      });
    } catch {
      // best effort
    }
    setWaitlistState('done');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(12,12,16,0.88)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl p-8 animate-fade-in"
        style={{ background: '#13131a', border: '1px solid rgba(240,237,232,0.09)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150"
          style={{ color: 'rgba(240,237,232,0.35)', background: 'rgba(240,237,232,0.06)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f0ede8')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.35)')}
        >
          <X size={15} />
        </button>

        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
            style={{ background: 'rgba(232,85,106,0.12)', border: '1px solid rgba(232,85,106,0.25)' }}
          >
            <Crown size={24} style={{ color: '#e8556a' }} />
          </div>
          <h2 className="font-serif text-2xl font-medium mb-2" style={{ color: '#f0ede8' }}>
            {title ?? 'Unlock the full DateOS'}
          </h2>
          <p className="text-sm" style={{ color: 'rgba(240,237,232,0.45)', fontFamily: 'Outfit, sans-serif' }}>
            {subtitle ?? 'Unlimited plans, What to Wear, Date Tips and saved plans.'}
          </p>
        </div>

        {unavailable ? (
          <div className="text-center px-2">
            <p className="font-serif text-xl mb-2" style={{ color: '#f0ede8' }}>Premium is launching soon</p>
            <p className="text-sm mb-6" style={{ color: 'rgba(240,237,232,0.5)', fontFamily: 'Outfit, sans-serif' }}>
              We're finishing setup. Want an email the moment it opens?
            </p>
            {waitlistState === 'done' ? (
              <p className="text-sm" style={{ color: '#e8556a', fontFamily: 'Outfit, sans-serif' }}>You're on the list. Thank you!</p>
            ) : (
              <button
                onClick={joinWaitlist}
                disabled={waitlistState === 'sending'}
                className="btn-rose text-sm px-6 py-3"
                style={{ fontFamily: 'Outfit, sans-serif', opacity: waitlistState === 'sending' ? 0.6 : 1 }}
              >
                {waitlistState === 'sending' ? 'Saving...' : 'Notify me'}
              </button>
            )}
          </div>
        ) : (
          <>
        <div className="space-y-3">
          {/* Pro Monthly */}
          <button
            onClick={() => handlePlanSelect('pro_monthly')}
            
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200"
            style={{ background: 'rgba(232,85,106,0.07)', border: '1px solid rgba(232,85,106,0.22)', opacity: loading && loading !== 'pro_monthly' ? 0.5 : 1 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232,85,106,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,85,106,0.38)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232,85,106,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,85,106,0.22)'; }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,85,106,0.15)', border: '1px solid rgba(232,85,106,0.3)' }}>
                <Star size={15} style={{ color: '#e8556a' }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: '#f0ede8', fontFamily: 'Outfit, sans-serif' }}>DateOS Premium · Monthly</p>
                <p className="text-xs" style={{ color: 'rgba(240,237,232,0.4)', fontFamily: 'Outfit, sans-serif' }}>Cancel anytime</p>
              </div>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#e8556a', fontFamily: 'Outfit, sans-serif' }}>
              {loading === 'pro_monthly' ? '...' : <span>$7.99<span className="text-xs font-normal" style={{ color: 'rgba(232,85,106,0.7)' }}>/mo</span></span>}
            </span>
          </button>

          {/* Pro Annual */}
          <button
            onClick={() => handlePlanSelect('pro_annual')}
            
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 relative overflow-hidden"
            style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.28)', opacity: loading && loading !== 'pro_annual' ? 0.5 : 1 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.45)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.28)'; }}
          >
            <span
              className="absolute top-0 right-0 text-xs font-semibold px-3 py-1 rounded-bl-xl rounded-tr-2xl"
              style={{ background: 'rgba(201,168,76,0.2)', color: '#c9a84c', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.03em' }}
            >
              Best Value
            </span>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
                <Crown size={15} style={{ color: '#c9a84c' }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: '#f0ede8', fontFamily: 'Outfit, sans-serif' }}>DateOS Premium · Annual</p>
                <p className="text-xs" style={{ color: 'rgba(240,237,232,0.4)', fontFamily: 'Outfit, sans-serif' }}>Save 38% · $4.92/mo</p>
              </div>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#c9a84c', fontFamily: 'Outfit, sans-serif' }}>
              {loading === 'pro_annual' ? '...' : <span>$59<span className="text-xs font-normal" style={{ color: 'rgba(201,168,76,0.7)' }}>/yr</span></span>}
            </span>
          </button>
        </div>

        <ul className="mt-6 space-y-2">
          {['Unlimited date plans', 'What to Wear for every date', 'Date Tips on every plan', 'Save and revisit your plans'].map(f => (
            <li key={f} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(240,237,232,0.55)', fontFamily: 'Outfit, sans-serif' }}>
              <Check size={12} style={{ color: '#e8556a' }} /> {f}
            </li>
          ))}
        </ul>

          </>
        )}

        {!unavailable && (
          <p className="text-xs text-center mt-6" style={{ color: 'rgba(240,237,232,0.25)', fontFamily: 'Outfit, sans-serif' }}>
            Coupon codes accepted at checkout.
          </p>
        )}
      </div>
    </div>
  );
}