import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sphere, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';

// A conceptual dummy "Medical Avatar" for demonstration purposes.
// In production, this would load a rigged GLTF/GLB human model.
// A conceptual dummy "Medical Avatar" for demonstration purposes.
interface DummyAvatarProps {
    movement: 'SHOULDER_ABDUCTION' | 'NECK_ROTATION' | 'SPINE_FLEXION' | 'SQUAT';
}

const DummyAvatar: React.FC<DummyAvatarProps> = ({ movement }) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const torsoRef = useRef<THREE.Group>(null);
    const legsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const slowTime = time * 1.5;

        // Reset rotations
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0;
        if (rightArmRef.current) rightArmRef.current.rotation.z = 0;
        if (headRef.current) headRef.current.rotation.y = 0;
        if (torsoRef.current) torsoRef.current.rotation.x = 0;
        if (legsRef.current) legsRef.current.position.y = 0;

        if (movement === 'SHOULDER_ABDUCTION') {
            const angle = (Math.sin(slowTime) * 0.5 + 0.5) * (Math.PI * 0.85);
            if (leftArmRef.current) leftArmRef.current.rotation.z = angle;
            if (rightArmRef.current) rightArmRef.current.rotation.z = -angle;
        } else if (movement === 'NECK_ROTATION') {
            const angle = Math.sin(slowTime) * (Math.PI * 0.4);
            if (headRef.current) headRef.current.rotation.y = angle;
        } else if (movement === 'SPINE_FLEXION') {
            const angle = (Math.sin(slowTime) * 0.5 + 0.5) * (Math.PI * 0.3);
            if (torsoRef.current) torsoRef.current.rotation.x = angle;
        } else if (movement === 'SQUAT') {
            const depth = (Math.sin(slowTime) * 0.5 + 0.5) * 0.8;
            if (groupRef.current) groupRef.current.position.y = -1 - depth;
        }
    });

    return (
        <group ref={groupRef} position={[0, -1, 0]}>
            {/* Torso */}
            <group ref={torsoRef} position={[0, 1, 0]}>
                <Box args={[1, 2, 0.5]}>
                    <meshStandardMaterial color="#005f73" roughness={0.2} metalness={0.8} />
                </Box>
                {/* Head */}
                <group ref={headRef} position={[0, 1.5, 0]}>
                    <Sphere args={[0.4, 32, 32]}>
                        <meshStandardMaterial color="#ffffff" roughness={0.1} />
                    </Sphere>
                    <Box args={[0.1, 0.1, 0.3]} position={[0, 0, 0.35]}>
                        <meshStandardMaterial color="#333" />
                    </Box>
                </group>
                {/* Left Arm */}
                <group ref={leftArmRef} position={[-0.6, 0.8, 0]}>
                    <Cylinder args={[0.15, 0.12, 1.5]} position={[0, -0.6, 0]}>
                        <meshStandardMaterial color="#0a9396" />
                    </Cylinder>
                </group>
                {/* Right Arm */}
                <group ref={rightArmRef} position={[0.6, 0.8, 0]}>
                    <Cylinder args={[0.15, 0.12, 1.5]} position={[0, -0.6, 0]}>
                        <meshStandardMaterial color="#0a9396" />
                    </Cylinder>
                </group>
            </group>
            {/* Legs */}
            <group ref={legsRef}>
                <Cylinder args={[0.2, 0.15, 2]} position={[-0.25, -0.5, 0]}>
                    <meshStandardMaterial color="#001219" />
                </Cylinder>
                <Cylinder args={[0.2, 0.15, 2]} position={[0.25, -0.5, 0]}>
                    <meshStandardMaterial color="#001219" />
                </Cylinder>
            </group>
        </group>
    );
};

export const MedicalAvatar: React.FC<{ movement?: any }> = ({ movement = 'SHOULDER_ABDUCTION' }) => {
    return (
        <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-200 rounded-2xl overflow-hidden shadow-inner relative">
            <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <span className="text-sm font-bold text-brand-teal flex items-center capitalize">
                    <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse mr-2"></div>
                    Demonstrating: {movement.replace('_', ' ').toLowerCase()}
                </span>
            </div>
            <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1.5} />
                <directionalLight position={[-10, 10, -10]} intensity={0.5} color="#005f73" />
                <Environment preset="studio" />
                <DummyAvatar movement={movement} />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />
            </Canvas>
        </div>
    );
};
