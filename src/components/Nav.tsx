import { Link, useLocation } from 'react-router-dom';
import { Heart, BookHeart } from 'lucide-react';

export default function Nav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(12,12,16,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(232,85,106,0.15)', border: '1px solid rgba(232,85,106,0.3)' }}>
            <Heart size={15} className="text-rose fill-rose" style={{ color: '#e8556a' }} />
          </div>
          <span className="font-serif text-xl font-medium tracking-wide"><span style={{ color: '#f0ede8' }}>Date</span><span style={{ color: '#e8556a' }}>OS</span></span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/plan"
            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              color: pathname === '/plan' ? '#e8556a' : 'rgba(240,237,232,0.6)',
              background: pathname === '/plan' ? 'rgba(232,85,106,0.1)' : 'transparent',
            }}
          >
            Plan
          </Link>
          <Link
            to="/saved"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              color: pathname === '/saved' ? '#e8556a' : 'rgba(240,237,232,0.6)',
              background: pathname === '/saved' ? 'rgba(232,85,106,0.1)' : 'transparent',
            }}
          >
            <BookHeart size={14} />
            Saved
          </Link>
        </div>
      </div>
    </nav>
  );
}
