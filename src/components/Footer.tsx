import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(240,237,232,0.06)' }}>
      <div className="flex items-center justify-center gap-1 flex-wrap mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <Link to="/privacy" className="text-xs transition-colors duration-150" style={{ color: 'rgba(240,237,232,0.25)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.25)')}>Privacy Policy</Link>
        <span className="text-xs" style={{ color: 'rgba(240,237,232,0.15)' }}>·</span>
        <Link to="/terms" className="text-xs transition-colors duration-150" style={{ color: 'rgba(240,237,232,0.25)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.25)')}>Terms of Service</Link>
        <span className="text-xs" style={{ color: 'rgba(240,237,232,0.15)' }}>·</span>
        <Link to="/disclaimer" className="text-xs transition-colors duration-150" style={{ color: 'rgba(240,237,232,0.25)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.25)')}>Disclaimer</Link>
      </div>
      <p className="text-xs" style={{ color: 'rgba(240,237,232,0.15)', fontFamily: 'Outfit, sans-serif' }}>
        © {new Date().getFullYear()} DateOS. All rights reserved.
      </p>
    </footer>
  );
}