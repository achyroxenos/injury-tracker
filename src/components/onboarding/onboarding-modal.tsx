"use client";

import { useState } from "react";
import { Activity, Sparkles, ChevronRight, ArrowRight, BarChart3, Camera } from "lucide-react";

const SLIDES = [
    {
        icon: Activity,
        title: "Welcome to HealTrace",
        subtitle: "Your AI-powered recovery companion",
        description: "Track injuries, visualize healing progress, and get smart insights — all in one beautiful app.",
        gradient: "from-primary to-rose-500",
    },
    {
        icon: BarChart3,
        title: "Track & Visualize",
        subtitle: "See your recovery unfold",
        description: "Log pain levels, symptoms, and treatments daily. Watch trends emerge with beautiful charts and healing pace indicators.",
        gradient: "from-indigo-500 to-purple-500",
    },
    {
        icon: Camera,
        title: "Photo Comparison",
        subtitle: "Visual proof of healing",
        description: "Take photos with angle guidance, compare before/after with a slider, and annotate with drawing tools.",
        gradient: "from-emerald-500 to-teal-500",
    },
];

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window === "undefined") return false;
        return !localStorage.getItem("onboarding-complete");
    });
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleComplete = () => {
        localStorage.setItem("onboarding-complete", "true");
        setIsOpen(false);
    };

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    if (!isOpen) return null;

    const slide = SLIDES[currentSlide];
    const Icon = slide.icon;
    const isLast = currentSlide === SLIDES.length - 1;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl overflow-hidden animate-bounce-in border border-border/50">
                {/* Gradient Header */}
                <div className={`h-48 bg-gradient-to-br ${slide.gradient} relative flex items-center justify-center animate-gradient`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative flex flex-col items-center text-white">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 shadow-lg">
                            <Icon className="w-8 h-8" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 opacity-80" />
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{slide.subtitle}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <h2 className="text-xl font-black tracking-tight mb-2">{slide.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{slide.description}</p>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {SLIDES.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-6 bg-primary" : "w-1.5 bg-secondary"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!isLast && (
                            <button
                                onClick={handleComplete}
                                className="flex-1 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl"
                            >
                                Skip
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className={`flex-1 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm ${isLast ? "w-full" : ""}`}
                        >
                            {isLast ? (
                                <>Get Started <ArrowRight className="w-4 h-4" /></>
                            ) : (
                                <>Next <ChevronRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
