import { useState } from 'react';
import { X, Zap, Star, Crown } from 'lucide-react';
import { getStoredEmail } from '../lib/userStore';

interface Props {
  onClose: () => void;
}

export default function PaywallModal({ onClose }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePlanSelect(plan: 'single' | 'pro_monthly' | 'pro_annual') {
    setLoading(plan);
    try {
      const email = getStoredEmail();
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email }),
      });
      const data = await res.json();
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
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150"
          style={{ color: 'rgba(240,237,232,0.35)', background: 'rgba(240,237,232,0.06)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f0ede8')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.35)')}
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
            style={{ background: 'rgba(232,85,106,0.12)', border: '1px solid rgba(232,85,106,0.25)' }}
          >
            <Crown size={24} style={{ color: '#e8556a' }} />
          </div>
          <h2 className="font-serif text-2xl font-medium mb-2" style={{ color: '#f0ede8' }}>
            You've used your 2 free plans
          </h2>
          <p className="text-sm" style={{ color: 'rgba(240,237,232,0.45)', fontFamily: 'Outfit, sans-serif' }}>
            Upgrade to keep planning unforgettable dates.
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-3">
          {/* Single Plan */}
          <button
            onClick={() => handlePlanSelect('single')}
            disabled={!!loading}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200"
            style={{ background: 'rgba(240,237,232,0.04)', border: '1px solid rgba(240,237,232,0.08)', opacity: loading && loading !== 'single' ? 0.5 : 1 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,237,232,0.18)'; (e.currentTarget as HTMLElement).style.background = 'rgba(240,237,232,0.07)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,237,232,0.08)'; (e.currentTarget as HTMLElement).style.background = 'rgba(240,237,232,0.04)'; }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(240,237,232,0.07)', border: '1px solid rgba(240,237,232,0.1)' }}>
                <Zap size={15} style={{ color: 'rgba(240,237,232,0.6)' }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: '#f0ede8', fontFamily: 'Outfit, sans-serif' }}>Single Plan</p>
                <p className="text-xs" style={{ color: 'rgba(240,237,232,0.4)', fontFamily: 'Outfit, sans-serif' }}>One perfect date, no commitment</p>
              </div>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#f0ede8', fontFamily: 'Outfit, sans-serif' }}>
              {loading === 'single' ? '...' : '$7.99'}
            </span>
          </button>

          {/* Pro Monthly */}
          <button
            onClick={() => handlePlanSelect('pro_monthly')}
            disabled={!!loading}
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
                <p className="text-sm font-medium" style={{ color: '#f0ede8', fontFamily: 'Outfit, sans-serif' }}>Pro Monthly</p>
                <p className="text-xs" style={{ color: 'rgba(240,237,232,0.4)', fontFamily: 'Outfit, sans-serif' }}>Unlimited plans every month</p>
              </div>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#e8556a', fontFamily: 'Outfit, sans-serif' }}>
              {loading === 'pro_monthly' ? '...' : <span>$19.99<span className="text-xs font-normal" style={{ color: 'rgba(232,85,106,0.7)' }}>/mo</span></span>}
            </span>
          </button>

          {/* Pro Annual */}
          <button
            onClick={() => handlePlanSelect('pro_annual')}
            disabled={!!loading}
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
                <p className="text-sm font-medium" style={{ color: '#f0ede8', fontFamily: 'Outfit, sans-serif' }}>Pro Annual</p>
                <p className="text-xs" style={{ color: 'rgba(240,237,232,0.4)', fontFamily: 'Outfit, sans-serif' }}>Unlimited plans — save 25%</p>
              </div>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#c9a84c', fontFamily: 'Outfit, sans-serif' }}>
              {loading === 'pro_annual' ? '...' : <span>$179<span className="text-xs font-normal" style={{ color: 'rgba(201,168,76,0.7)' }}>/yr</span></span>}
            </span>
          </button>
        </div>

        <p className="text-xs text-center mt-6" style={{ color: 'rgba(240,237,232,0.25)', fontFamily: 'Outfit, sans-serif' }}>
          Coupon codes accepted at checkout.
        </p>
      </div>
    </div>
  );
}