"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type InjuryLog = {
    id: string;
    injuryId: string;
    date: string;
    imageUrl?: string;
    painLevel: number;
    temperature?: number; // New for illness
    symptoms?: string[]; // New for illness
    notes: string;
    treatments?: Treatment[]; // New: Array of treatments applied at this time
    activityLevel?: "low" | "medium" | "high"; // New: Correlate pain with movement
};

export type Treatment = {
    id: string;
    name: string; // e.g., "Ibuprofen", "Bandage Change"
    type: "medication" | "dressing" | "therapy" | "other";
    dosage?: string; // "200mg"
    time: string;
};

export type Injury = {
    id: string;
    type: "injury" | "illness"; // Discriminator
    bodyPart: string; // "General" for illness
    cause: string; // or "Diagnosis"
    status: "healing" | "worsening" | "stagnant" | "healed";
    archived?: boolean; // Soft delete
    startDate: string;
    logs: InjuryLog[]; // Array of chronological updates
};

type InjuryContextType = {
    injuries: Injury[];
    addInjury: (data: Omit<Injury, "id" | "status" | "startDate" | "logs">, initialLog: Omit<InjuryLog, "id" | "date" | "injuryId">) => void;
    addLogToInjury: (injuryId: string, log: Omit<InjuryLog, "id" | "date" | "injuryId">) => void;
    getInjury: (id: string) => Injury | undefined;
    getStreak: () => number;
};

const InjuryContext = createContext<InjuryContextType | undefined>(undefined);

export function InjuryProvider({ children }: { children: React.ReactNode }) {
    const [injuries, setInjuries] = useState<Injury[]>([]);

    // Fetch initial data
    useEffect(() => {
        fetchInjuries();
    }, []);

    // Save to localStorage when not using Supabase
    useEffect(() => {
        if (!isSupabaseConfigured && injuries.length > 0) {
            localStorage.setItem("injury-data", JSON.stringify(injuries));
        }
    }, [injuries]);

    const fetchInjuries = async () => {
        // Fallback to localStorage if Supabase is not configured
        if (!isSupabaseConfigured) {
            const saved = localStorage.getItem("injury-data");
            if (saved) {
                try {
                    setInjuries(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse injury data", e);
                }
            }
            return;
        }

        // Fetch injuries from Supabase
        const { data: injuriesData, error: injError } = await supabase
            .from('injuries')
            .select('*')
            .order('start_date', { ascending: false });

        if (injError || !injuriesData) {
            // If table doesn't exist or other error, mostly expected on first run if not set up
            if (injError.code !== 'PGRST116') { // Ignore result size 0 or similar simple errors? No, log real errors.
                console.error("Error fetching injuries:", injError);
            }
            return;
        }

        // Fetch logs for these injuries
        const injuryIds = injuriesData.map(i => i.id);
        if (injuryIds.length === 0) {
            setInjuries([]);
            return;
        }

        const { data: logsData, error: logError } = await supabase
            .from('logs')
            .select('*')
            .in('injury_id', injuryIds)
            .order('date', { ascending: true });

        if (logError) {
            console.error("Error fetching logs:", logError);
            return;
        }

        // Map DB snake_case to app camelCase
        const mappedInjuries: Injury[] = injuriesData.map(i => ({
            id: i.id,
            type: i.type,
            bodyPart: i.body_part,
            cause: i.cause,
            status: i.status,
            archived: i.archived,
            startDate: i.start_date,
            logs: logsData
                ?.filter(l => l.injury_id === i.id)
                .map(l => ({
                    id: l.id,
                    injuryId: l.injury_id,
                    date: l.date,
                    imageUrl: l.image_url,
                    painLevel: l.pain_level,
                    temperature: l.temperature,
                    symptoms: l.symptoms,
                    notes: l.notes,
                    treatments: l.treatments,
                    activityLevel: l.activity_level
                })) || []
        }));

        setInjuries(mappedInjuries);
    };

    const addInjury = async (
        data: Omit<Injury, "id" | "status" | "startDate" | "logs">,
        initialLog: Omit<InjuryLog, "id" | "date" | "injuryId">
    ) => {
        // Fallback to localStorage
        if (!isSupabaseConfigured) {
            const newInjury: Injury = {
                ...data,
                id: crypto.randomUUID(),
                status: "healing",
                startDate: new Date().toISOString(),
                logs: []
            };

            const initialLogEntry: InjuryLog = {
                ...initialLog,
                id: crypto.randomUUID(),
                injuryId: newInjury.id,
                date: new Date().toISOString(),
            };

            newInjury.logs.push(initialLogEntry);
            setInjuries((prev) => [newInjury, ...prev]);
            return;
        }

        // Insert Injury to Supabase
        const { data: newInjury, error: injError } = await supabase
            .from('injuries')
            .insert({
                type: data.type,
                body_part: data.bodyPart,
                cause: data.cause,
                status: 'healing',
                start_date: new Date().toISOString()
            })
            .select()
            .single();

        if (injError || !newInjury) {
            alert("Failed to save injury: " + injError?.message);
            return;
        }

        // Insert Log
        const { error: logError } = await supabase
            .from('logs')
            .insert({
                injury_id: newInjury.id,
                date: new Date().toISOString(),
                image_url: initialLog.imageUrl,
                pain_level: initialLog.painLevel,
                notes: initialLog.notes,
                temperature: initialLog.temperature,
                symptoms: initialLog.symptoms,
                treatments: initialLog.treatments,
                activity_level: initialLog.activityLevel
            });

        if (logError) {
            alert("Failed to save log: " + logError.message);
            return;
        }

        fetchInjuries(); // Refresh local state
    };

    const addLogToInjury = async (injuryId: string, logData: Omit<InjuryLog, "id" | "date" | "injuryId">) => {
        // Fallback to localStorage
        if (!isSupabaseConfigured) {
            const newLog: InjuryLog = {
                ...logData,
                id: crypto.randomUUID(),
                injuryId,
                date: new Date().toISOString(),
            };

            setInjuries((prev) =>
                prev.map((inj) =>
                    inj.id === injuryId ? { ...inj, logs: [...inj.logs, newLog] } : inj
                )
            );
            return;
        }

        // Insert to Supabase
        const { error } = await supabase
            .from('logs')
            .insert({
                injury_id: injuryId,
                date: new Date().toISOString(),
                image_url: logData.imageUrl,
                pain_level: logData.painLevel,
                notes: logData.notes,
                temperature: logData.temperature,
                symptoms: logData.symptoms,
                treatments: logData.treatments,
                activity_level: logData.activityLevel
            });

        if (error) {
            alert("Failed to add log: " + error.message);
            return;
        }

        fetchInjuries(); // Refresh
    };

    const getInjury = (id: string) => injuries.find((i) => i.id === id);

    const getStreak = () => {
        // Collect all unique log dates
        const allDates = new Set<string>();
        injuries.forEach(inj => {
            inj.logs.forEach(log => {
                allDates.add(new Date(log.date).toDateString());
            });
            // Also count the start date
            allDates.add(new Date(inj.startDate).toDateString());
        });

        // Sort dates descending
        const sortedDates = Array.from(allDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (sortedDates.length === 0) return 0;

        let streak = 0;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        // Check if streak is active (logged today or yesterday)
        if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
            return 0;
        }

        // Count backwards
        let currentCheck = new Date();
        // If the latest log was yesterday, start checking from yesterday
        if (sortedDates[0] === yesterday) {
            currentCheck.setDate(currentCheck.getDate() - 1);
        }

        while (true) {
            const checkStr = currentCheck.toDateString();
            if (allDates.has(checkStr)) {
                streak++;
                currentCheck.setDate(currentCheck.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    };

    return (
        <InjuryContext.Provider value={{ injuries, addInjury, addLogToInjury, getInjury, getStreak }}>
            {children}
        </InjuryContext.Provider>
    );
}

export const useInjury = () => {
    const context = useContext(InjuryContext);
    if (!context) {
        throw new Error("useInjury must be used within an InjuryProvider");
    }
    return context;
};
