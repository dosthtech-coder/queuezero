import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SessionAPI } from '../api/client';
import { MedicalAvatar } from '../components/MedicalAvatar';
import { SkeletonOverlay } from '../components/SkeletonOverlay';
import { Activity, ShieldCheck } from 'lucide-react';

const PROTOCOL_STAGES = [
    { id: 'CALIBRATION', name: 'Spatial Calibration', duration: 3000, instruction: 'Stand still and face the camera.', movement: 'SHOULDER_ABDUCTION' },
    { id: 'NECK', name: 'Neck Rotation', duration: 5000, instruction: 'Slowly rotate your head left and right.', movement: 'NECK_ROTATION' },
    { id: 'SHOULDER', name: 'Shoulder Abduction', duration: 7000, instruction: 'Slowly raise both arms to your sides.', movement: 'SHOULDER_ABDUCTION' },
    { id: 'SPINE', name: 'Spine Flexion', duration: 5000, instruction: 'Bend forward slowly at the waist.', movement: 'SPINE_FLEXION' },
    { id: 'SQUAT', name: 'Squat / Lower Limb', duration: 5000, instruction: 'Perform a slow, shallow squat.', movement: 'SQUAT' },
];

export const Assessment: React.FC = () => {
    const { sessionId, setStep } = useAppStore();
    const [currentStageIdx, setCurrentStageIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isCompiling, setIsCompiling] = useState(false);

    const currentStage = PROTOCOL_STAGES[currentStageIdx];

    useEffect(() => {
        if (!sessionId) {
            alert("No active session found.");
            setStep('INTAKE');
            return;
        }

        const stageDuration = currentStage.duration;
        const interval = 100;
        let elapsed = 0;

        const timer = setInterval(() => {
            elapsed += interval;
            const stageProgress = (elapsed / stageDuration) * 100;

            // Overall progress weighted by stage index
            const totalProgress = ((currentStageIdx / PROTOCOL_STAGES.length) * 100) + (stageProgress / PROTOCOL_STAGES.length);
            setProgress(Math.min(totalProgress, 100));

            if (elapsed >= stageDuration) {
                clearInterval(timer);
                if (currentStageIdx < PROTOCOL_STAGES.length - 1) {
                    setCurrentStageIdx(prev => prev + 1);
                } else {
                    finishSession();
                }
            }
        }, interval);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, currentStageIdx]);

    const handleTelemetry = (data: any) => {
        if (!sessionId || isCompiling) return;
        // Tag telemetry with current movement for backend context (optional but helpful)
        const enrichedData = { ...data, protocol_stage: currentStage.id };
        SessionAPI.sendTelemetry(sessionId, enrichedData).catch(console.error);
    };

    const finishSession = async () => {
        setIsCompiling(true);
        try {
            if (sessionId) {
                await SessionAPI.conclude(sessionId);
                setStep('RESULTS');
            }
        } catch (error) {
            console.error("Failed to conclude session", error);
            alert("Failed to compile report. Backend error.");
            setIsCompiling(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-6">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 px-4">
                <div className="flex items-center space-x-3">
                    <Activity className="text-brand-teal w-8 h-8" />
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">QUEUEZERO™ Assessment</h1>
                </div>
                <div className="flex items-center text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                    <ShieldCheck className="w-5 h-5 mr-2 text-brand-teal" />
                    End-to-End Encrypted Edge Inference
                </div>
            </header>

            {/* Main Split View */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: 3D Guided Avatar */}
                <section className="flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-xl font-bold text-gray-900">1. Mirror This Movement</h2>
                        <span className="bg-brand-teal/10 text-brand-teal px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Stage {currentStageIdx + 1}/{PROTOCOL_STAGES.length}
                        </span>
                    </div>
                    <p className="text-gray-500 mb-6">{currentStage.instruction}</p>
                    <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100">
                        <MedicalAvatar movement={currentStage.movement} />
                    </div>
                </section>

                {/* Right: Camera Feed & Tracking */}
                <section className="flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">2. Live Sensor Tracking</h2>
                    <p className="text-gray-500 mb-6">Ensure your full body is visible within the frame.</p>
                    <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100 relative">
                        <SkeletonOverlay onTelemetryFrame={handleTelemetry} movement={currentStage.movement} />

                        {/* Progress Overlay */}
                        <div className="absolute top-4 right-4 bg-brand-dark/80 backdrop-blur text-white px-6 py-3 rounded-2xl flex items-center shadow-lg border border-white/10">
                            <span className="font-mono text-xl mr-3 font-bold">{Math.floor(progress)}%</span>
                            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00f5d4]" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}></div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer Status Bar */}
            <footer className="mt-8 bg-brand-teal text-white p-6 rounded-2xl shadow-lg flex items-center justify-between transition-all duration-500">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#00f5d4] rounded-full animate-pulse mr-4"></div>
                    <span className="font-medium text-lg tracking-wide">
                        {isCompiling ? "Compiling Clinical Report..." : currentStage.name}
                    </span>
                </div>
                <div className="text-brand-navy opacity-80 text-sm">
                    Session ID: {sessionId} | PhysioMimica Engine v1.0
                </div>
            </footer>
        </div>
    );
};
