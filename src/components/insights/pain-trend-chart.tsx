"use client";

import { InjuryLog } from "@/context/injury-context";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
    logs: InjuryLog[];
};

export function PainTrendChart({ logs }: Props) {
    if (logs.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                No logs yet. Start logging to see trends.
            </div>
        );
    }

    const data = logs.map(log => ({
        date: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        pain: log.painLevel,
    }));

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                        dataKey="date"
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
                            boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="pain"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        fill="url(#painGradient)"
                        dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                        activeDot={{ r: 5, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "hsl(var(--background))" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
