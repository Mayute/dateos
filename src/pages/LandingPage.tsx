import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Wallet, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Footer from '../components/Footer';
import EmailGate from '../components/EmailGate';
import { getStoredEmail } from '../lib/userStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showEmailGate, setShowEmailGate] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const orbs = [
      { x: 0.2, y: 0.3, r: 350, color: 'rgba(232,85,106,0.07)', speed: 0.0008, offset: 0 },
      { x: 0.75, y: 0.6, r: 400, color: 'rgba(201,168,76,0.05)', speed: 0.0006, offset: 2 },
      { x: 0.5, y: 0.8, r: 300, color: 'rgba(232,85,106,0.05)', speed: 0.001, offset: 4 },
      { x: 0.85, y: 0.15, r: 250, color: 'rgba(201,168,76,0.04)', speed: 0.0007, offset: 1 },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 1;

      orbs.forEach((orb) => {
        const cx = orb.x * canvas.width + Math.sin((t * orb.speed + orb.offset)) * 60;
        const cy = orb.y * canvas.height + Math.cos((t * orb.speed * 1.3 + orb.offset)) * 40;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  function handlePlanClick() {
    if (getStoredEmail()) {
      navigate('/plan');
    } else {
      setShowEmailGate(true);
    }
  }

  function handleEmailAuthenticated() {
    setShowEmailGate(false);
    navigate('/plan');
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#0c0c10' }}>
      {showEmailGate && <EmailGate onAuthenticated={handleEmailAuthenticated} />}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(232,85,106,0.15)', border: '1px solid rgba(232,85,106,0.3)' }}>
            <span className="text-base" style={{ color: '#e8556a' }}>♥</span>
          </div>
          <span className="font-serif text-2xl font-medium tracking-wide"><span style={{ color: '#f0ede8' }}>Date</span><span style={{ color: '#e8556a' }}>OS</span></span>
        </div>
        <button
          onClick={() => navigate('/saved')}
          className="text-sm font-medium transition-colors duration-200 px-4 py-2 rounded-full"
          style={{ color: 'rgba(240,237,232,0.5)', border: '1px solid rgba(240,237,232,0.1)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f0ede8')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.5)')}
        >
          Saved Plans
        </button>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
        <h1 className="font-serif font-medium leading-tight mb-6 animate-slide-up"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', color: '#f0ede8', maxWidth: '800px', letterSpacing: '-0.01em' }}>
          Your perfect date night,<br />
          <span style={{ color: '#e8556a', fontStyle: 'italic' }}>planned in 60 seconds.</span>
        </h1>

        <p className="text-base md:text-lg mb-10 max-w-md font-light leading-relaxed"
          style={{ color: 'rgba(240,237,232,0.55)', fontFamily: 'Outfit, sans-serif' }}>
          Tell us what you want. We plan the perfect night — from the neighborhood to the last cocktail.
        </p>

        <button
          onClick={handlePlanClick}
          className="btn-rose flex items-center gap-3 text-base mb-14"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Plan My Date Night
          <ArrowRight size={18} />
        </button>

        {/* Feature chips */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: <MapPin size={14} />, text: 'Any City' },
            { icon: <Wallet size={14} />, text: 'Any Budget' },
            { icon: <Sparkles size={14} />, text: 'Any Vibe' },
          ].map(({ icon, text }) => (
            <div key={text}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
              style={{
                background: 'rgba(240,237,232,0.04)',
                border: '1px solid rgba(240,237,232,0.1)',
                color: 'rgba(240,237,232,0.5)',
              }}>
              <span style={{ color: '#e8556a' }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </main>

      {/* Bottom section */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Curated neighborhoods',
                desc: 'We pick the perfect area of the city, not just a venue.',
              },
              {
                title: 'Full timeline, ordered',
                desc: 'Cocktails, dinner, dessert — each with a reason and a time.',
              },
              {
                title: 'Real local insight',
                desc: 'What to order, how to book, what to skip.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="card-dark p-6 rounded-2xl transition-all duration-300"
                style={{ background: 'rgba(19,19,26,0.7)', border: '1px solid rgba(240,237,232,0.07)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,85,106,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(240,237,232,0.07)')}>
                <div className="w-8 h-0.5 mb-4 rounded" style={{ background: '#e8556a' }} />
                <h3 className="font-serif text-lg font-medium mb-2" style={{ color: '#f0ede8' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,237,232,0.45)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}