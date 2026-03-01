import React from 'react';
import { Home } from './pages/Home';
import { Intake } from './pages/Intake';
import { Assessment } from './pages/Assessment';
import { Results } from './pages/Results';
import { useAppStore } from './store/useAppStore';

function App() {
  const { step } = useAppStore();

  return (
    <div className="w-full min-h-screen font-sans selection:bg-brand-teal selection:text-white">
      {step === 'IDLE' && <Home />}
      {step === 'INTAKE' && <Intake />}
      {step === 'ASSESSMENT' && <Assessment />}
      {step === 'RESULTS' && <Results />}
    </div>
  );
}

export default App;






