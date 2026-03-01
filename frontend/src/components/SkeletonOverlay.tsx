import React, { useEffect, useRef } from 'react';

// Generates fake telemetry data that mimics the selected movement
const generateMockTelemetry = (movement: string) => {
    const time = Date.now() / 1000;
    const cycle = (Math.sin(time * 1.5) * 0.5 + 0.5); // 0 to 1

    const base = {
        left_hip: [-0.2, -0.5, 0],
        right_hip: [0.2, -0.5, 0],
        left_shoulder: [-0.3, 0.5, 0],
        right_shoulder: [0.3, 0.5, 0],
        left_elbow: [-0.4, 0, 0],
        right_elbow: [0.4, 0, 0],
        left_knee: [-0.2, -1.0, 0],
        right_knee: [0.2, -1.0, 0],
        left_ankle: [-0.2, -1.5, 0],
        right_ankle: [0.2, -1.5, 0],
        nose: [0, 0.8, 0]
    };

    if (movement === 'SHOULDER_ABDUCTION') {
        const angle = cycle * Math.PI * 0.8;
        base.left_elbow = [
            base.left_shoulder[0] - Math.sin(angle) * 0.6,
            base.left_shoulder[1] - Math.cos(angle) * 0.6,
            0
        ];
        base.right_elbow = [
            base.right_shoulder[0] + Math.sin(angle) * 0.6,
            base.right_shoulder[1] - Math.cos(angle) * 0.6,
            0
        ];
    } else if (movement === 'NECK_ROTATION') {
        base.nose = [Math.sin(time * 2) * 0.2, 0.8, 0.1];
    } else if (movement === 'SPINE_FLEXION') {
        const depth = cycle * 0.4;
        base.left_shoulder[1] -= depth;
        base.right_shoulder[1] -= depth;
        base.nose[1] -= depth;
    } else if (movement === 'SQUAT') {
        const depth = cycle * 0.5;
        ['left_hip', 'right_hip', 'left_shoulder', 'right_shoulder', 'nose'].forEach(k => {
            (base as any)[k][1] -= depth;
        });
        base.left_knee[1] -= depth * 0.5;
        base.right_knee[1] -= depth * 0.5;
    }

    return base;
};

interface SkeletonOverlayProps {
    onTelemetryFrame: (data: any) => void;
    movement?: string;
}

export const SkeletonOverlay: React.FC<SkeletonOverlayProps> = ({ onTelemetryFrame, movement = 'SHOULDER_ABDUCTION' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const telemetry = generateMockTelemetry(movement);
            onTelemetryFrame(telemetry);

            // Draw abstract representation
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Center coordinate system
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    const scale = 150; // Scale standard coordinates to pixels

                    // Style
                    ctx.strokeStyle = '#00f5d4'; // Glowing cyan
                    ctx.lineWidth = 4;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';

                    const drawPoint = (p: number[]) => {
                        ctx.beginPath();
                        ctx.arc(cx + p[0] * scale, cy - p[1] * scale, 6, 0, Math.PI * 2);
                        ctx.fillStyle = '#0a9396';
                        ctx.fill();
                        ctx.stroke();
                    };

                    const drawLine = (p1: number[], p2: number[]) => {
                        ctx.beginPath();
                        ctx.moveTo(cx + p1[0] * scale, cy - p1[1] * scale);
                        ctx.lineTo(cx + p2[0] * scale, cy - p2[1] * scale);
                        ctx.stroke();
                    };

                    // Simple skeleton
                    drawLine(telemetry.left_hip, telemetry.left_shoulder);
                    drawLine(telemetry.right_hip, telemetry.right_shoulder);
                    drawLine(telemetry.left_shoulder, telemetry.right_shoulder);
                    drawLine(telemetry.left_hip, telemetry.right_hip);
                    drawLine(telemetry.left_shoulder, telemetry.left_elbow);
                    drawLine(telemetry.right_shoulder, telemetry.right_elbow);

                    if (telemetry.left_knee) drawLine(telemetry.left_hip, telemetry.left_knee);
                    if (telemetry.right_knee) drawLine(telemetry.right_hip, telemetry.right_knee);
                    if (telemetry.left_ankle) drawLine(telemetry.left_knee, telemetry.left_ankle);
                    if (telemetry.right_ankle) drawLine(telemetry.right_knee, telemetry.right_ankle);

                    Object.values(telemetry).forEach((p: any) => drawPoint(p));
                }
            }
        }, 100); // 10fps fake data generation

        return () => clearInterval(interval);
    }, [onTelemetryFrame, movement]);

    return (
        <div className="w-full h-full bg-gray-900 rounded-2xl overflow-hidden relative flex items-center justify-center">
            {/* Mirror overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent z-0"></div>

            <canvas
                ref={canvasRef}
                width={400}
                height={600}
                className="z-10 w-full h-full object-contain mix-blend-screen opacity-90 filter drop-shadow-[0_0_8px_rgba(0,245,212,0.8)]"
            />

            <div className="absolute bottom-6 w-full text-center z-20">
                <span className="bg-brand-dark/80 backdrop-blur text-[#00f5d4] px-4 py-2 rounded-full border border-[#00f5d4]/30 font-mono text-sm tracking-widest">
                    TRACKING ACTIVE
                </span>
            </div>
        </div>
    );
};
