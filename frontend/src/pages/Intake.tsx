import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PatientAPI, SessionAPI } from '../api/client';
import { Activity, User, Briefcase, Activity as HeartPulse } from 'lucide-react';

export const Intake: React.FC = () => {
    const { setPatientData, setSessionData, setStep } = useAppStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        mrn: `MRN-${Math.floor(Math.random() * 1000000)}`,
        first_name: '',
        last_name: '',
        age: 35,
        sex: 'M',
        height_cm: 175,
        weight_kg: 70,
        occupation: 'Desk Worker',
        dominant_side: 'Right',
        primary_complaint: 'Routine Checkup',
        vas_score: 2
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create Patient
            const patientPayload = {
                mrn: formData.mrn,
                first_name: formData.first_name || 'John',
                last_name: formData.last_name || 'Doe',
                age: Number(formData.age),
                sex: formData.sex,
                height_cm: Number(formData.height_cm),
                weight_kg: Number(formData.weight_kg),
                occupation: formData.occupation,
                dominant_side: formData.dominant_side
            };

            let patientId;
            try {
                const pResponse = await PatientAPI.create(patientPayload);
                patientId = pResponse.id;
            } catch (err: any) {
                // Mock handling for 'already exists' in hackathon setup
                console.warn("Patient creation note:", err.response?.data?.detail);
                patientId = 1; // Fallback to first patient if exists
            }

            setPatientData(patientId);

            // 2. Create Session
            const sResponse = await SessionAPI.create(patientId, {
                primary_complaint: formData.primary_complaint,
                vas_score: Number(formData.vas_score),
                heart_rate_bpm: Math.floor(Math.random() * (90 - 60 + 1)) + 60, // Mock vitals
                blood_pressure_sys: 120,
                blood_pressure_dia: 80,
            });

            setSessionData(sResponse.id);

            // 3. Move to Assessment Step
            setStep('ASSESSMENT');

        } catch (error) {
            console.error("Intake Error:", error);
            alert("Failed to start session. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="glass-panel w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

                {/* Left Side Branding */}
                <div className="bg-brand-teal p-12 text-white flex flex-col justify-center">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">QUEUEZERO™</h1>
                    <p className="text-brand-navy opacity-80 text-xl font-medium mb-12">Primary Waiting Diagnosis</p>

                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <User className="w-8 h-8 text-white/70" />
                            <p className="text-lg text-white/90">Contactless Registration</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Activity className="w-8 h-8 text-white/70" />
                            <p className="text-lg text-white/90">AI Movement Tracking</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Briefcase className="w-8 h-8 text-white/70" />
                            <p className="text-lg text-white/90">Contextual Risk Inference</p>
                        </div>
                    </div>
                </div>

                {/* Right Side Form */}
                <div className="p-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Context</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-teal transition-all" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-teal transition-all" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-teal transition-all" value={formData.age} onChange={e => setFormData({ ...formData, age: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                                <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-teal transition-all" value={formData.height_cm} onChange={e => setFormData({ ...formData, height_cm: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-teal transition-all" value={formData.weight_kg} onChange={e => setFormData({ ...formData, weight_kg: Number(e.target.value) })} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation Core Profile</label>
                            <select className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-teal transition-all" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })}>
                                <option>Desk Worker</option>
                                <option>Manual Labor</option>
                                <option>Athlete</option>
                                <option>Retired</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Complaint</label>
                            <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-teal transition-all" value={formData.primary_complaint} onChange={e => setFormData({ ...formData, primary_complaint: e.target.value })} />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-8 bg-brand-teal hover:bg-brand-navy text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center"
                        >
                            {loading ? (
                                <span className="animate-pulse">Initializing PhysioMimica...</span>
                            ) : (
                                <>Start Clinical Assessment <HeartPulse className="ml-2 w-5 h-5" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
