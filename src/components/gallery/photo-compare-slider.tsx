"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

type Props = {
    beforeImage: string;
    afterImage: string;
    beforeDate: string;
    afterDate: string;
};

export function PhotoCompareSlider({ beforeImage, afterImage, beforeDate, afterDate }: Props) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current || !isDragging.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percent);
    }, []);

    const handleMouseDown = () => { isDragging.current = true; };
    const handleMouseUp = () => { isDragging.current = false; };
    const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-square rounded-2xl overflow-hidden border border-border/50 shadow-lg cursor-col-resize select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleTouchMove}
        >
            {/* After image (full background) */}
            <div className="absolute inset-0">
                <Image src={afterImage} alt="After" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>

            {/* Before image (clipped) */}
            <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <Image src={beforeImage} alt="Before" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>

            {/* Slider handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)] z-10"
                style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M5 3L2 8L5 13" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11 3L14 8L11 13" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Date labels */}
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm z-20">
                Before · {beforeDate}
            </div>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm z-20">
                After · {afterDate}
            </div>
        </div>
    );
}
