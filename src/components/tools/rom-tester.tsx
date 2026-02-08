"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Play, Pause, Save, RotateCcw } from "lucide-react";

export function RangeOfMotion({ onSave }: { onSave: (angle: number) => void }) {
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [angle, setAngle] = useState(0);
    const [startAngle, setStartAngle] = useState<number | null>(null);
    const [maxAngle, setMaxAngle] = useState(0);

    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (!isMeasuring) return;

            // Use beta (x-axis tilt) for flexion/extension mainly
            const currentTilt = event.beta || 0;

            if (startAngle === null) {
                setStartAngle(currentTilt);
            } else {
                const diff = Math.abs(currentTilt - startAngle);
                setAngle(Math.round(diff));
                if (diff > maxAngle) {
                    setMaxAngle(Math.round(diff));
                }
            }
        };

        if (isMeasuring && typeof window !== 'undefined') {
            window.addEventListener("deviceorientation", handleOrientation);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener("deviceorientation", handleOrientation);
            }
        };
    }, [isMeasuring, startAngle, maxAngle]);

    const toggleMeasure = () => {
        if (isMeasuring) {
            // Stop
            setIsMeasuring(false);
        } else {
            // Start
            setStartAngle(null);
            setAngle(0);
            setMaxAngle(0);
            setIsMeasuring(true);
        }
    };

    // Fallback slider for desktop/non-sensor devices
    const handleManualSlide = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isMeasuring) return;
        const val = parseInt(e.target.value);
        setAngle(val);
        setMaxAngle(val);
    };

    return (
        <div className="bg-card border rounded-xl p-6 space-y-6 text-center shadow-sm">
            <h3 className="font-bold flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Range of Motion (ROM)
            </h3>

            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                {/* Visual Arc */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                    <circle
                        cx="96" cy="96" r="88"
                        fill="none"
                        stroke="#be123c"
                        strokeWidth="12"
                        strokeDasharray={2 * Math.PI * 88}
                        strokeDashoffset={2 * Math.PI * 88 * (1 - angle / 180)}
                        className="transition-all duration-300 ease-out"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="space-y-1">
                    <div className="text-5xl font-black tabular-nums tracking-tighter">
                        {angle}°
                    </div>
                    <div className="text-xs text-muted-foreground uppercase font-bold">Flexion</div>
                </div>
            </div>

            <div className="flex gap-2 justify-center">
                <button
                    onClick={toggleMeasure}
                    className={isMeasuring
                        ? "bg-red-100 text-red-600 px-6 py-3 rounded-full font-bold flex items-center gap-2"
                        : "bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2"
                    }
                >
                    {isMeasuring ? <><Pause className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Start Measure</>}
                </button>
                {!isMeasuring && maxAngle > 0 && (
                    <button
                        onClick={() => onSave(maxAngle)}
                        className="bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> Save
                    </button>
                )}
            </div>

            <div className="pt-4 border-t">
                <label className="text-xs text-muted-foreground mb-2 block">Manual Adjustment (No Sensor)</label>
                <input
                    type="range"
                    min="0"
                    max="180"
                    value={angle}
                    onChange={handleManualSlide}
                    className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    disabled={isMeasuring}
                />
            </div>
        </div>
    );
}
