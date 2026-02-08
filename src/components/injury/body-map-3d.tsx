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

    return (
        <mesh
            position={position}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            {geometry === "sphere" ? <sphereGeometry args={args} /> : <boxGeometry args={args} />}
            <meshStandardMaterial color={hovered ? "#fda4af" : color} />
            {hovered && (
                <Html distanceFactor={10}>
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                        {name}
                    </div>
                </Html>
            )}
        </mesh>
    );
}

export function BodyMap3D({ onPartSelect, selectedPart }: { onPartSelect: (part: string) => void, selectedPart?: string }) {
    return (
        <div className="w-full h-[300px] bg-secondary/10 rounded-xl overflow-hidden border">
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <BodyModel onSelectPart={onPartSelect} selectedPart={selectedPart} />
                <OrbitControls enableZoom={false} />
            </Canvas>
            <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground pointer-events-none bg-white/50 px-2 rounded">
                Drag to rotate • Tap to select
            </div>
        </div>
    );
}
