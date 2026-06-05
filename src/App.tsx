import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PlannerPage from './pages/PlannerPage';
import ResultPage from './pages/ResultPage';
import SavedPage from './pages/SavedPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import DisclaimerPage from './pages/DisclaimerPage';
import { markPaid, markSinglePlan } from './hooks/usePlanGate';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === 'true') {
      if (params.get('plan') === 'single') {
        markSinglePlan();
      } else {
        markPaid();
      }
      navigate('/', { replace: true });
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/plan" element={<PlannerPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/saved" element={<SavedPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/disclaimer" element={<DisclaimerPage />} />
    </Routes>
  );
}

export default App;
