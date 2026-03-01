import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Play } from 'lucide-react';

export const Home: React.FC = () => {
    const { setStep } = useAppStore();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-brand-teal/5 blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-brand-navy/5 blur-3xl"></div>

            <div className="glass-panel max-w-2xl w-full p-16 text-center z-10 relative">
                <div className="mb-8 relative inline-flex justify-center items-center">
                    <div className="absolute inset-0 bg-brand-teal/20 rounded-full blur-xl animate-pulse-ring"></div>
                    <div className="w-24 h-24 bg-white rounded-full shadow-lg border-2 border-brand-teal flex items-center justify-center relative z-10">
                        <div className="w-12 h-12 rounded-full border-t-4 border-brand-teal animate-spin"></div>
                    </div>
                </div>

                <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">QUEUEZERO™</h1>
                <p className="text-xl text-gray-500 font-medium mb-12 max-w-md mx-auto">
                    Intelligent primary waiting assessment powered by PhysioMimica
                </p>

                <button
                    onClick={() => setStep('INTAKE')}
                    className="bg-brand-teal hover:bg-brand-navy text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center mx-auto"
                >
                    Tap Screen to Begin <Play className="ml-3 w-5 h-5 fill-current" />
                </button>
            </div>

            <div className="absolute bottom-8 text-center text-sm text-gray-400 font-medium w-full">
                Powered by AMD Edge Compute | ISB-Compliant Biomechanics
            </div>
        </div>
    );
};
