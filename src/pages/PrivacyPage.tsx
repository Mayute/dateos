import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0c0c10' }}>
      <div className="sticky top-0 z-40" style={{ background: 'rgba(12,12,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm transition-colors duration-200"
            style={{ color: 'rgba(240,237,232,0.5)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f0ede8')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.5)')}>
            <ArrowLeft size={16} /> Back
          </button>
          <span className="font-serif text-xl font-medium"><span style={{ color: '#f0ede8' }}>Date</span><span style={{ color: '#e8556a' }}>OS</span></span>
          <div className="w-16" />
        </div>
      </div>
      <div className="flex-1 max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl font-medium mb-6" style={{ color: '#f0ede8' }}>Privacy Policy</h1>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,237,232,0.5)', fontFamily: 'Outfit, sans-serif' }}>
          DateOS does not collect, store, or share any personal data. All date plans are generated in real time and stored locally on your device only. We do not use cookies for tracking or analytics.
        </p>
      </div>
      <Footer />
    </div>
  );
}
