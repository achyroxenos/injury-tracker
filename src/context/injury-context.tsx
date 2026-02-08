"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type InjuryLog = {
    id: string;
    date: string;
    imageUrl?: string;
    bodyPart: string;
    painLevel: number;
    cause: string;
    notes: string;
    status: "healing" | "healed" | "worsening";
};

type InjuryContextType = {
    logs: InjuryLog[];
    addLog: (log: Omit<InjuryLog, "id" | "date" | "status">) => void;
    getLog: (id: string) => InjuryLog | undefined;
};

const InjuryContext = createContext<InjuryContextType | undefined>(undefined);

export function InjuryProvider({ children }: { children: React.ReactNode }) {
    const [logs, setLogs] = useState<InjuryLog[]>([]);

    // Load from local storage on mount (client-side only)
    useEffect(() => {
        const saved = localStorage.getItem("injury-logs");
        if (saved) {
            try {
                setLogs(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse logs", e);
            }
        }
    }, []);

    // Save to local storage whenever logs change
    useEffect(() => {
        localStorage.setItem("injury-logs", JSON.stringify(logs));
    }, [logs]);

    const addLog = (data: Omit<InjuryLog, "id" | "date" | "status">) => {
        const newLog: InjuryLog = {
            ...data,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            status: "healing",
        };
        setLogs((prev) => [newLog, ...prev]);
    };

    const getLog = (id: string) => logs.find((l) => l.id === id);

    return (
        <InjuryContext.Provider value={{ logs, addLog, getLog }}>
            {children}
        </InjuryContext.Provider>
    );
}

export function useInjury() {
    const context = useContext(InjuryContext);
    if (context === undefined) {
        throw new Error("useInjury must be used within an InjuryProvider");
    }
    return context;
}
