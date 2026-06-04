import { X, Zap, Star, Crown } from 'lucide-react';

const SINGLE_PLAN_URL = 'https://buy.stripe.com/9B6bIU6SK4dy657do19ws00';
const PRO_MONTHLY_URL = 'https://buy.stripe.com/9B600cgtk11m0KN1Fj9ws01';
const PRO_ANNUAL_URL = 'https://buy.stripe.com/cNidR2cd48tO8df6ZD9ws02';

interface Props {
  onClose: () => void;
}

export default function PaywallModal({ onClose }: Props) {
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
            You've used your 2 free plans this month
          </h2>
          <p className="text-sm" style={{ color: 'rgba(240,237,232,0.45)', fontFamily: 'Outfit, sans-serif' }}>
            Upgrade to keep planning unforgettable dates.
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-3">
          {/* Single Plan */}
          <a
            href={SINGLE_PLAN_URL}
            className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 group"
            style={{ background: 'rgba(240,237,232,0.04)', border: '1px solid rgba(240,237,232,0.08)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,237,232,0.18)'; (e.currentTarget as HTMLElement).style.background = 'rgba(240,237,232,0.07)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,237,232,0.08)'; (e.currentTarget as HTMLElement).style.background = 'rgba(240,237,232,0.04)'; }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(240,237,232,0.07)', border: '1px solid rgba(240,237,232,0.1)' }}>
                <Zap size={15} style={{ color: 'rgba(240,237,232,0.6)' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#f0ede8', fontFamily: 'Outfit, sans-serif' }}>Single Plan</p>
                <p className="text-xs" style={{ color: 'rgba(240,237,232,0.4)', fontFamily: 'Outfit, sans-serif' }}>One perfect date, no commitment</p>
              </div>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#f0ede8', fontFamily: 'Outfit, sans-serif' }}>$2.99</span>
          </a>

          {/* Pro Monthly */}
          <a
            href={PRO_MONTHLY_URL}
            className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200"
            style={{ background: 'rgba(232,85,106,0.07)', border: '1px solid rgba(232,85,106,0.22)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232,85,106,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,85,106,0.38)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232,85,106,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,85,106,0.22)'; }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,85,106,0.15)', border: '1px solid rgba(232,85,106,0.3)' }}>
                <Star size={15} style={{ color: '#e8556a' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#f0ede8', fontFamily: 'Outfit, sans-serif' }}>Pro Monthly</p>
                <p className="text-xs" style={{ color: 'rgba(240,237,232,0.4)', fontFamily: 'Outfit, sans-serif' }}>Unlimited plans every month</p>
              </div>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#e8556a', fontFamily: 'Outfit, sans-serif' }}>$12.99<span className="text-xs font-normal" style={{ color: 'rgba(232,85,106,0.7)' }}>/mo</span></span>
          </a>

          {/* Pro Annual — Best Value */}
          <a
            href={PRO_ANNUAL_URL}
            className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 relative overflow-hidden"
            style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.28)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.45)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.28)'; }}
          >
            {/* Best Value badge */}
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
              <div>
                <p className="text-sm font-medium" style={{ color: '#f0ede8', fontFamily: 'Outfit, sans-serif' }}>Pro Annual</p>
                <p className="text-xs" style={{ color: 'rgba(240,237,232,0.4)', fontFamily: 'Outfit, sans-serif' }}>Unlimited plans — save 36%</p>
              </div>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#c9a84c', fontFamily: 'Outfit, sans-serif' }}>$99<span className="text-xs font-normal" style={{ color: 'rgba(201,168,76,0.7)' }}>/yr</span></span>
          </a>
        </div>

        <p className="text-xs text-center mt-6" style={{ color: 'rgba(240,237,232,0.25)', fontFamily: 'Outfit, sans-serif' }}>
          Free tier resets on the 1st of each month.
        </p>
      </div>
    </div>
  );
}
