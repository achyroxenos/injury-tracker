"use client";

import { InjuryLog } from "@/context/injury-context";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    logs: InjuryLog[];
};

export function HealingPaceCard({ logs }: Props) {
    if (logs.length < 2) {
        return (
            <Card className="glass border-border/50">
                <CardContent className="p-5 text-center text-sm text-muted-foreground">
                    Need at least 2 logs to calculate healing pace.
                </CardContent>
            </Card>
        );
    }

    // Split logs into first half and second half
    const midpoint = Math.floor(logs.length / 2);
    const firstHalf = logs.slice(0, midpoint);
    const secondHalf = logs.slice(midpoint);

    const avgFirst = firstHalf.reduce((sum, l) => sum + l.painLevel, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, l) => sum + l.painLevel, 0) / secondHalf.length;
    const diff = avgSecond - avgFirst;

    let status: "improving" | "worsening" | "stagnant";
    if (diff < -0.5) status = "improving";
    else if (diff > 0.5) status = "worsening";
    else status = "stagnant";

    const config = {
        improving: {
            icon: TrendingDown,
            label: "Improving",
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
        },
        worsening: {
            icon: TrendingUp,
            label: "Worsening",
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
        },
        stagnant: {
            icon: Minus,
            label: "Stable",
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20",
        },
    };

    const { icon: Icon, label, color, bg, border } = config[status];

    return (
        <Card className={cn("border", border, bg)}>
            <CardContent className="p-5 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bg)}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Healing Pace</p>
                    <p className={cn("text-xl font-black", color)}>{label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        Avg pain: {avgFirst.toFixed(1)} → {avgSecond.toFixed(1)}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
