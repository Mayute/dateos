import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { getStoredEmail } from '../lib/userStore';

export default function SuccessPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    async function confirm() {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      const appEmail = getStoredEmail();

      if (!sessionId || !appEmail) {
        setStatus('error');
        return;
      }

      try {
        const res = await fetch('/api/confirm-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, app_email: appEmail }),
        });

        if (!res.ok) throw new Error('Failed to confirm');

        setStatus('success');

        // Redirect to planner after 3 seconds
        setTimeout(() => navigate('/plan'), 3000);
      } catch {
        setStatus('error');
      }
    }

    confirm();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0c0c10' }}
    >
      {status === 'loading' && (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto mb-6" />
          <p className="text-sm" style={{ color: 'rgba(240,237,232,0.5)', fontFamily: 'Outfit, sans-serif' }}>
            Confirming your payment...
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <CheckCircle size={56} className="mx-auto mb-6" style={{ color: '#e8556a' }} />
          <h1 className="font-serif text-3xl font-medium mb-3" style={{ color: '#f0ede8' }}>
            You're all set!
          </h1>
          <p className="text-sm mb-2" style={{ color: 'rgba(240,237,232,0.5)', fontFamily: 'Outfit, sans-serif' }}>
            Your plan is now active. Redirecting you to the planner...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <h1 className="font-serif text-3xl font-medium mb-3" style={{ color: '#f0ede8' }}>
            Something went wrong
          </h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(240,237,232,0.5)', fontFamily: 'Outfit, sans-serif' }}>
            Your payment went through but we couldn't confirm it automatically.
          </p>
          <button
            onClick={() => navigate('/plan')}
            className="btn-rose"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Go to Planner
          </button>
        </div>
      )}
    </div>
  );
}