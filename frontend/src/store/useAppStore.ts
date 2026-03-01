import { create } from 'zustand';

interface AppState {
    patientId: number | null;
    sessionId: number | null;
    step: 'IDLE' | 'INTAKE' | 'ASSESSMENT' | 'RESULTS';
    setPatientData: (id: number) => void;
    setSessionData: (id: number) => void;
    setStep: (step: 'IDLE' | 'INTAKE' | 'ASSESSMENT' | 'RESULTS') => void;
    reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    patientId: null,
    sessionId: null,
    step: 'IDLE',
    setPatientData: (id) => set({ patientId: id }),
    setSessionData: (id) => set({ sessionId: id }),
    setStep: (step) => set({ step }),
    reset: () => set({ patientId: null, sessionId: null, step: 'IDLE' })
}));
