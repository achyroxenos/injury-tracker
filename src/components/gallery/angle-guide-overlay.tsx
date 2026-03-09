"use client";

import Image from "next/image";
import { useState } from "react";
import { Crosshair } from "lucide-react";

type Props = {
    referenceImageUrl?: string;
};

export function AngleGuideOverlay({ referenceImageUrl }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    if (!referenceImageUrl) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsVisible(!isVisible)}
                className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-all ${isVisible
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
            >
                <Crosshair className="w-3.5 h-3.5" />
                {isVisible ? "Hide Guide" : "Align Photo"}
            </button>

            {isVisible && (
                <div className="mt-3 relative w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-primary/40 bg-secondary/30">
                    <Image
                        src={referenceImageUrl}
                        alt="Angle reference"
                        fill
                        className="object-cover opacity-30"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Crosshair overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-px bg-primary/30" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="h-full w-px bg-primary/30" />
                    </div>
                    {/* Corner brackets */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-primary/50 rounded-tl-sm" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-primary/50 rounded-tr-sm" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-primary/50 rounded-bl-sm" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-primary/50 rounded-br-sm" />

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                        Match this angle
                    </div>
                </div>
            )}
        </div>
    );
}
