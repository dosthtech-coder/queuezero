import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SessionAPI } from '../api/client';
import { CheckCircle, FileText, ArrowRight } from 'lucide-react';

export const Results: React.FC = () => {
    const { sessionId, reset } = useAppStore();
    const [reportUrl, setReportUrl] = useState<string | null>(null);

    useEffect(() => {
        if (sessionId) {
            SessionAPI.getReport(sessionId)
                .then(res => setReportUrl(res.report_url))
                .catch(err => console.error("Could not fetch report link:", err));
        }
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Success Confetti Backing Concept */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-teal/5 rounded-full blur-[100px] z-0 pointer-events-none"></div>

            <div className="glass-panel max-w-xl w-full p-12 text-center z-10 relative border-t-8 border-t-brand-teal">

                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete!</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Your primary kinematic screening has been successfully processed and mapped to your securely encrypted EMR profile.
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 text-left">
                    <div className="flex items-start">
                        <FileText className="w-8 h-8 text-brand-teal mr-4 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">Doctor's Patient Card Ready</h3>
                            <p className="text-gray-500 text-sm">
                                Your attending physician already has your generated QUEUEZERO™ kinematic report and probabilistic risk analysis waiting for them on their tablet.
                            </p>
                            {reportUrl && (
                                <p className="mt-4 text-xs font-mono text-gray-400">
                                    Local Path: {reportUrl}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={reset}
                    className="bg-brand-teal hover:bg-brand-navy w-full text-white text-lg font-bold py-4 px-8 rounded-xl shadow-lg transition-colors flex items-center justify-center"
                >
                    Return to Home <ArrowRight className="ml-2 w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
