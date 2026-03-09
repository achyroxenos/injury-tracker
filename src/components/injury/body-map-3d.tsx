"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

function BodyModel({ onSelectPart, selectedPart }: { onSelectPart: (part: string) => void, selectedPart?: string }) {
    // In a real app, we would load a proper .gltf model here.
    // For this prototype, we'll construct a "body" out of geometric primitives.

    return (
        <group position={[0, -1, 0]}>
            {/* Head */}
            <BodyPart
                position={[0, 1.7, 0]}
                args={[0.25, 32, 32]}
                color={selectedPart === "Head" ? "#be123c" : "#cbd5e1"}
                name="Head"
                onClick={() => onSelectPart("Head")}
            />

            {/* Torso */}
            <BodyPart
                position={[0, 0.8, 0]}
                geometry="box"
                args={[0.5, 1, 0.3]}
                color={selectedPart === "Torso" ? "#be123c" : "#94a3b8"}
                name="Torso"
                onClick={() => onSelectPart("Torso")}
            />

            {/* L. Arm */}
            <BodyPart
                position={[-0.4, 0.8, 0]}
                geometry="box"
                args={[0.2, 0.9, 0.2]}
                color={selectedPart === "L. Arm" ? "#be123c" : "#cbd5e1"}
                name="L. Arm"
                onClick={() => onSelectPart("L. Arm")}
            />

            {/* R. Arm */}
            <BodyPart
                position={[0.4, 0.8, 0]}
                geometry="box"
                args={[0.2, 0.9, 0.2]}
                color={selectedPart === "R. Arm" ? "#be123c" : "#cbd5e1"}
                name="R. Arm"
                onClick={() => onSelectPart("R. Arm")}
            />

            {/* L. Leg */}
            <BodyPart
                position={[-0.15, -0.2, 0]}
                geometry="box"
                args={[0.2, 1, 0.2]}
                color={selectedPart === "L. Leg" ? "#be123c" : "#cbd5e1"}
                name="L. Leg"
                onClick={() => onSelectPart("L. Leg")}
            />

            {/* R. Leg */}
            <BodyPart
                position={[0.15, -0.2, 0]}
                geometry="box"
                args={[0.2, 1, 0.2]}
                color={selectedPart === "R. Leg" ? "#be123c" : "#cbd5e1"}
                name="R. Leg"
                onClick={() => onSelectPart("R. Leg")}
            />
        </group>
    );
}

function BodyPart({ position, args, color, name, onClick, geometry = "sphere" }: any) {
    const [hovered, setHover] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current && hovered) {
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1] + 0.05, 0.1);
        } else if (meshRef.current) {
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], 0.1);
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHover(false); document.body.style.cursor = 'default'; }}
            castShadow
            receiveShadow
        >
            {geometry === "sphere" ? <sphereGeometry args={args} /> : <boxGeometry args={args} />}
            <meshStandardMaterial
                color={hovered ? "#fb7185" : color}
                roughness={0.4}
                metalness={0.1}
                envMapIntensity={1}
            />
            {hovered && (
                <Html distanceFactor={10} zIndexRange={[100, 0]}>
                    <div className="bg-foreground/90 text-background text-xs font-semibold px-2.5 py-1.5 rounded-md pointer-events-none whitespace-nowrap shadow-xl backdrop-blur-sm animate-in-up">
                        {name}
                    </div>
                </Html>
            )}
        </mesh>
    );
}

export function BodyMap3D({ onPartSelect, selectedPart }: { onPartSelect: (part: string) => void, selectedPart?: string }) {
    return (
        <div className="w-full h-[350px] bg-gradient-to-b from-secondary/50 to-background rounded-2xl overflow-hidden border shadow-inner relative">
            <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} shadows>
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#be123c" />
                <BodyModel onSelectPart={onPartSelect} selectedPart={selectedPart} />
                <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} />
            </Canvas>
            <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                <span className="bg-background/80 backdrop-blur-sm text-[10px] font-medium text-muted-foreground px-3 py-1.5 rounded-full shadow-sm border">
                    Drag to rotate • Tap to select
                </span>
            </div>
        </div>
    );
}
