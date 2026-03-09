"use client";

import { InjuryLog } from "@/context/injury-context";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Props = {
    logs: InjuryLog[];
};

export function TreatmentEffectiveness({ logs }: Props) {
    // Gather all treatment names
    const treatmentPainMap: Record<string, { totalPain: number; count: number }> = {};

    logs.forEach(log => {
        log.treatments?.forEach(t => {
            if (!treatmentPainMap[t.name]) {
                treatmentPainMap[t.name] = { totalPain: 0, count: 0 };
            }
            treatmentPainMap[t.name].totalPain += log.painLevel;
            treatmentPainMap[t.name].count += 1;
        });
    });

    // Calculate avg pain for days WITHOUT any treatment
    const logsWithoutTreatment = logs.filter(l => !l.treatments || l.treatments.length === 0);
    const avgNoTreatment = logsWithoutTreatment.length > 0
        ? logsWithoutTreatment.reduce((s, l) => s + l.painLevel, 0) / logsWithoutTreatment.length
        : 0;

    const data = Object.entries(treatmentPainMap)
        .map(([name, { totalPain, count }]) => ({
            name,
            "With Treatment": parseFloat((totalPain / count).toFixed(1)),
            "Without": parseFloat(avgNoTreatment.toFixed(1)),
        }))
        .slice(0, 6); // Top 6

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                No treatment data recorded yet.
            </div>
        );
    }

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[0, 10]}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                        }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    />
                    <Bar dataKey="With Treatment" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={18} />
                    <Bar dataKey="Without" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
