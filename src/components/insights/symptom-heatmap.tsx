"use client";

import { InjuryLog } from "@/context/injury-context";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Props = {
    logs: InjuryLog[];
};

const COLORS = [
    "hsl(var(--primary))",
    "hsl(346 77% 50%)",       // rose
    "hsl(262 83% 58%)",       // purple
    "hsl(199 89% 48%)",       // sky blue
    "hsl(142 71% 45%)",       // green
    "hsl(38 92% 50%)",        // amber
];

export function SymptomHeatmap({ logs }: Props) {
    // Count symptom frequency
    const symptomCounts: Record<string, number> = {};
    logs.forEach(log => {
        log.symptoms?.forEach(symptom => {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
    });

    const data = Object.entries(symptomCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8); // Top 8

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                No symptom data recorded yet.
            </div>
        );
    }

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        width={90}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                        }}
                        cursor={{ fill: "hsl(var(--secondary))", opacity: 0.3 }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
