import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import App from './App.tsx';
import './index.css';

// Remember which link brought the visitor (first visit wins) so sign-ups can be attributed to it.
try {
  const src = new URLSearchParams(window.location.search).get('utm_source');
  if (src && /^[a-z0-9_.-]{1,50}$/i.test(src) && !localStorage.getItem('dateos_ref')) {
    localStorage.setItem('dateos_ref', src.toLowerCase());
  }
} catch {
  // storage unavailable (private mode): skip attribution
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
    </BrowserRouter>
  </StrictMode>
);