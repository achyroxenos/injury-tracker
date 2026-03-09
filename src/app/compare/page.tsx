"use client";

import { useState } from "react";
import { useInjury } from "@/context/injury-context";
import { PhotoCompareSlider } from "@/components/gallery/photo-compare-slider";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ImageIcon } from "lucide-react";

export default function ComparePage() {
    const { injuries } = useInjury();
    const activeInjuries = injuries.filter(i => !i.archived);

    const [selectedInjuryId, setSelectedInjuryId] = useState<string>(activeInjuries[0]?.id || "");
    const [beforeIdx, setBeforeIdx] = useState<number>(0);
    const [afterIdx, setAfterIdx] = useState<number>(-1); // -1 = latest

    const resolvedSelectedInjuryId = selectedInjuryId || activeInjuries[0]?.id || "";
    const selectedInjury = activeInjuries.find(i => i.id === resolvedSelectedInjuryId);
    const photosWithDates = !selectedInjury
        ? []
        : selectedInjury.logs
              .filter(l => l.imageUrl)
              .map(l => ({
                  url: l.imageUrl as string,
                  date: new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  rawDate: l.date,
              }));

    // Resolve indices
    const resolvedAfterIdx = afterIdx === -1 ? photosWithDates.length - 1 : afterIdx;

    if (activeInjuries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in-up">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h2 className="text-xl font-bold mb-2">No Photos to Compare</h2>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                    Start logging injuries with photos to use the comparison tool.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in-up pb-[100px]">
            <header>
                <h1 className="text-2xl font-black tracking-tight">Compare Photos</h1>
                <p className="text-xs text-muted-foreground mt-1">Slide to reveal healing progress.</p>
            </header>

            {/* Injury Selector */}
            <div className="relative">
                <select
                    value={resolvedSelectedInjuryId}
                    onChange={(e) => {
                        setSelectedInjuryId(e.target.value);
                        setBeforeIdx(0);
                        setAfterIdx(-1);
                    }}
                    className="w-full appearance-none bg-card border border-border/50 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    {activeInjuries.map(inj => (
                        <option key={inj.id} value={inj.id}>{inj.bodyPart} — {inj.cause}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {photosWithDates.length < 2 ? (
                <Card className="border-dashed border-2 bg-secondary/20">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <ImageIcon className="w-10 h-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm text-muted-foreground">
                            Need at least 2 photos for this injury to compare.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Date selectors */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Before</label>
                            <select
                                value={beforeIdx}
                                onChange={(e) => setBeforeIdx(Number(e.target.value))}
                                className="w-full appearance-none bg-card border border-border/50 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                {photosWithDates.map((p, i) => (
                                    <option key={i} value={i}>{p.date}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">After</label>
                            <select
                                value={afterIdx}
                                onChange={(e) => setAfterIdx(Number(e.target.value))}
                                className="w-full appearance-none bg-card border border-border/50 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                <option value={-1}>Latest</option>
                                {photosWithDates.map((p, i) => (
                                    <option key={i} value={i}>{p.date}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Slider */}
                    <PhotoCompareSlider
                        beforeImage={photosWithDates[beforeIdx].url}
                        afterImage={photosWithDates[resolvedAfterIdx].url}
                        beforeDate={photosWithDates[beforeIdx].date}
                        afterDate={photosWithDates[resolvedAfterIdx].date}
                    />
                </>
            )}
        </div>
    );
}
