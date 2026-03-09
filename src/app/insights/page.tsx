"use client";

import { useState } from "react";
import { useInjury } from "@/context/injury-context";
import { Card, CardContent } from "@/components/ui/card";
import { PainTrendChart } from "@/components/insights/pain-trend-chart";
import { HealingPaceCard } from "@/components/insights/healing-pace-card";
import { SymptomHeatmap } from "@/components/insights/symptom-heatmap";
import { TreatmentEffectiveness } from "@/components/insights/treatment-effectiveness";
import { BarChart3, ChevronDown } from "lucide-react";

export default function InsightsPage() {
    const { injuries } = useInjury();
    const activeInjuries = injuries.filter(i => !i.archived);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Auto-select the first injury if none is selected
    const currentInjury = activeInjuries.find(i => i.id === selectedId) || activeInjuries[0];
    const logs = currentInjury?.logs || [];

    if (activeInjuries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in-up">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8 text-primary/50" />
                </div>
                <h2 className="text-xl font-bold mb-2">No Insights Yet</h2>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                    Start tracking an injury to unlock powerful recovery insights and visualizations.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in-up pb-[100px]">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Insights</h1>
                    <p className="text-xs text-muted-foreground mt-1">Your recovery, visualized.</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                </div>
            </header>

            {/* Injury Selector */}
            {activeInjuries.length > 1 && (
                <div className="relative">
                    <select
                        value={currentInjury?.id || ""}
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="w-full appearance-none bg-card border border-border/50 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    >
                        {activeInjuries.map(injury => (
                            <option key={injury.id} value={injury.id}>
                                {injury.bodyPart} — {injury.cause}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
            )}

            {/* Pain Trend */}
            <Card className="glass border-border/50 overflow-hidden">
                <CardContent className="p-5">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Pain Trend
                    </h3>
                    <PainTrendChart logs={logs} />
                </CardContent>
            </Card>

            {/* Healing Pace */}
            <HealingPaceCard logs={logs} />

            {/* Symptom Frequency */}
            <Card className="glass border-border/50 overflow-hidden">
                <CardContent className="p-5">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Symptom Frequency
                    </h3>
                    <SymptomHeatmap logs={logs} />
                </CardContent>
            </Card>

            {/* Treatment Effectiveness */}
            <Card className="glass border-border/50 overflow-hidden">
                <CardContent className="p-5">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Treatment Effectiveness
                    </h3>
                    <TreatmentEffectiveness logs={logs} />
                </CardContent>
            </Card>
        </div>
    );
}
