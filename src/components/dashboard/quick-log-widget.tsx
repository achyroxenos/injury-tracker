"use client";

import { useState } from "react";
import { useInjury, Injury } from "@/context/injury-context";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickLogWidget({ injury }: { injury: Injury }) {
    const { addLogToInjury } = useInjury();
    const [painLevel, setPainLevel] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Get the most recent log to carry over data (like symptoms, treatments, if we wanted to later)
    const latestLog = injury.logs[injury.logs.length - 1];

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate a slight network delay for UI feedback
        await new Promise(r => setTimeout(r, 600));

        const didSave = await addLogToInjury(injury.id, {
            painLevel,
            notes: "Quick Log completed.",
            // Carry over previous data if it exists
            temperature: latestLog?.temperature,
            symptoms: latestLog?.symptoms,
            activityLevel: latestLog?.activityLevel,
            imageUrl: latestLog?.imageUrl // Optional: carry over last photo or leave blank. Let's leave blank for new logs unless specified.
        });
        if (!didSave) {
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(false);
        setIsSuccess(true);
    };

    if (isSuccess) {
        return (
            <Card className="bg-green-500/10 border-green-500/20 animate-in-up">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-green-700 dark:text-green-400">Log Saved for {injury.bodyPart}!</p>
                        <p className="text-xs text-green-600/80 dark:text-green-500/80">Your streak is protected.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-md shadow-primary/5">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <Activity className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <h3 className="font-bold text-sm tracking-tight text-foreground">Quick Log: {injury.bodyPart}</h3>
                    </div>
                    <span className="text-[10px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        Due Today
                    </span>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs font-semibold mb-2">
                            <span className="text-muted-foreground">Current Pain</span>
                            <span className={cn(
                                painLevel > 7 ? "text-red-500" : painLevel > 4 ? "text-yellow-500" : "text-green-500"
                            )}>
                                {painLevel} / 10
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={painLevel}
                            onChange={(e) => setPainLevel(parseInt(e.target.value))}
                            className="w-full appearance-none h-2 bg-secondary rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110 transition-all cursor-pointer"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Log Today's Status"
                        )}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
