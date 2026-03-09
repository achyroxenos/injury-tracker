"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

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
    addInjury: (
        data: Omit<Injury, "id" | "status" | "startDate" | "logs">,
        initialLog: Omit<InjuryLog, "id" | "date" | "injuryId">
    ) => Promise<boolean>;
    addLogToInjury: (injuryId: string, log: Omit<InjuryLog, "id" | "date" | "injuryId">) => Promise<boolean>;
    getInjury: (id: string) => Injury | undefined;
    getStreak: () => number;
};

const InjuryContext = createContext<InjuryContextType | undefined>(undefined);

type LogFingerprint = {
    date: string;
    painLevel: number;
    notes: string;
    temperature?: number;
    imageUrl?: string;
};

type DbInjuryRow = {
    id: string;
    type: Injury["type"];
    body_part: string;
    cause: string;
    status: Injury["status"];
    archived: boolean | null;
    start_date: string;
};

type DbLogRow = {
    id: string;
    injury_id: string;
    date: string;
    image_url: string | null;
    pain_level: number;
    temperature: number | null;
    symptoms: string[] | null;
    notes: string | null;
    treatments: Treatment[] | null;
    activity_level: InjuryLog["activityLevel"] | null;
};

function makeLogFingerprint(log: LogFingerprint): string {
    return [
        log.date,
        log.painLevel,
        log.notes.trim(),
        log.temperature ?? "",
        log.imageUrl ?? "",
    ].join("|");
}

function mapDbLog(log: DbLogRow): InjuryLog {
    return {
        id: log.id,
        injuryId: log.injury_id,
        date: log.date,
        imageUrl: log.image_url ?? undefined,
        painLevel: log.pain_level,
        temperature: log.temperature ?? undefined,
        symptoms: log.symptoms ?? undefined,
        notes: log.notes ?? "",
        treatments: log.treatments ?? undefined,
        activityLevel: log.activity_level ?? undefined,
    };
}

function mapDbInjury(injury: DbInjuryRow, logs: InjuryLog[]): Injury {
    return {
        id: injury.id,
        type: injury.type,
        bodyPart: injury.body_part,
        cause: injury.cause,
        status: injury.status,
        archived: injury.archived ?? false,
        startDate: injury.start_date,
        logs,
    };
}

export function InjuryProvider({ children }: { children: React.ReactNode }) {
    const [injuries, setInjuries] = useState<Injury[]>([]);
    const [session, setSession] = useState<Session | null>(null);

    async function syncOfflineData(userId: string) {
        const saved = localStorage.getItem("injury-data");
        if (!saved) return;

        try {
            const localInjuries: Injury[] = JSON.parse(saved);
            if (localInjuries.length === 0) {
                localStorage.removeItem("injury-data");
                return;
            }

            console.log(`Migrating ${localInjuries.length} local records to cloud account...`);
            const unsyncedInjuries: Injury[] = [];

            for (const injury of localInjuries) {
                let remoteInjuryId: string | null = null;
                let injuryFailed = false;

                const { data: existingInjury, error: existingInjuryError } = await supabase
                    .from("injuries")
                    .select("id")
                    .eq("user_id", userId)
                    .eq("type", injury.type)
                    .eq("body_part", injury.bodyPart)
                    .eq("cause", injury.cause)
                    .eq("start_date", injury.startDate)
                    .limit(1)
                    .maybeSingle();

                if (existingInjuryError) {
                    console.error("Failed to look up existing injury during migration:", existingInjuryError);
                    unsyncedInjuries.push(injury);
                    continue;
                }

                if (existingInjury) {
                    remoteInjuryId = existingInjury.id;
                } else {
                    const { data: insertedInjury, error: injuryInsertError } = await supabase
                        .from("injuries")
                        .insert({
                            user_id: userId,
                            type: injury.type,
                            body_part: injury.bodyPart,
                            cause: injury.cause,
                            status: injury.status,
                            archived: injury.archived ?? false,
                            start_date: injury.startDate,
                        })
                        .select("id")
                        .single();

                    if (injuryInsertError || !insertedInjury) {
                        console.error("Failed to migrate injury:", injuryInsertError);
                        unsyncedInjuries.push(injury);
                        continue;
                    }

                    remoteInjuryId = insertedInjury.id;
                }

                const { data: existingLogs, error: existingLogsError } = await supabase
                    .from("logs")
                    .select("date, pain_level, notes, temperature, image_url")
                    .eq("injury_id", remoteInjuryId);

                if (existingLogsError) {
                    console.error("Failed to read existing logs during migration:", existingLogsError);
                    unsyncedInjuries.push(injury);
                    continue;
                }

                const existingLogFingerprints = new Set(
                    (existingLogs ?? []).map((log) =>
                        makeLogFingerprint({
                            date: log.date,
                            painLevel: log.pain_level,
                            notes: log.notes ?? "",
                            temperature: log.temperature ?? undefined,
                            imageUrl: log.image_url ?? undefined,
                        })
                    )
                );

                for (const log of injury.logs) {
                    const fingerprint = makeLogFingerprint({
                        date: log.date,
                        painLevel: log.painLevel,
                        notes: log.notes,
                        temperature: log.temperature,
                        imageUrl: log.imageUrl,
                    });

                    if (existingLogFingerprints.has(fingerprint)) continue;

                    const { error: logInsertError } = await supabase
                        .from("logs")
                        .insert({
                            injury_id: remoteInjuryId,
                            date: log.date,
                            image_url: log.imageUrl,
                            pain_level: log.painLevel,
                            notes: log.notes,
                            temperature: log.temperature,
                            symptoms: log.symptoms,
                            treatments: log.treatments,
                            activity_level: log.activityLevel,
                        });

                    if (logInsertError) {
                        console.error("Failed to migrate log:", logInsertError);
                        injuryFailed = true;
                        continue;
                    }

                    existingLogFingerprints.add(fingerprint);
                }

                if (injuryFailed) {
                    unsyncedInjuries.push(injury);
                }
            }

            if (unsyncedInjuries.length === 0) {
                localStorage.removeItem("injury-data");
                console.log("Migration complete!");
            } else {
                localStorage.setItem("injury-data", JSON.stringify(unsyncedInjuries));
                console.warn(`Migration partially failed. ${unsyncedInjuries.length} records kept locally for retry.`);
            }
        } catch (e) {
            console.error("Failed to migrate local injury data", e);
        }
    }

    async function fetchInjuries(userId?: string) {
        // Fallback to localStorage if Supabase is not configured or user is not logged in
        if (!isSupabaseConfigured || !userId) {
            const saved = localStorage.getItem("injury-data");
            if (saved) {
                try {
                    setInjuries(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse injury data", e);
                    setInjuries([]);
                }
            } else {
                setInjuries([]);
            }
            return;
        }

        // Fetch injuries from Supabase (RLS will automatically restrict to the user's data)
        const { data: injuriesData, error: injError } = await supabase
            .from('injuries')
            .select('*')
            .order('start_date', { ascending: false });

        if (injError) {
            console.error("Error fetching injuries:", injError);
            return;
        }

        if (!injuriesData) {
            setInjuries([]);
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

        const logsByInjuryId = new Map<string, InjuryLog[]>();
        for (const rawLog of logsData ?? []) {
            const log = mapDbLog(rawLog as DbLogRow);
            const existing = logsByInjuryId.get(log.injuryId) ?? [];
            existing.push(log);
            logsByInjuryId.set(log.injuryId, existing);
        }

        const mappedInjuries: Injury[] = injuriesData.map((rawInjury) =>
            mapDbInjury(rawInjury as DbInjuryRow, logsByInjuryId.get(rawInjury.id) ?? [])
        );

        setInjuries(mappedInjuries);
    }

    const addInjury = async (
        data: Omit<Injury, "id" | "status" | "startDate" | "logs">,
        initialLog: Omit<InjuryLog, "id" | "date" | "injuryId">
    ): Promise<boolean> => {
        // Fallback to localStorage
        if (!isSupabaseConfigured) {
            const nowIso = new Date().toISOString();
            const newInjury: Injury = {
                ...data,
                id: crypto.randomUUID(),
                status: "healing",
                startDate: nowIso,
                logs: []
            };

            const initialLogEntry: InjuryLog = {
                ...initialLog,
                id: crypto.randomUUID(),
                injuryId: newInjury.id,
                date: nowIso,
            };

            newInjury.logs.push(initialLogEntry);
            setInjuries((prev) => [newInjury, ...prev]);
            return true;
        }

        if (!session?.user?.id) {
            console.error("Cannot save injury without an authenticated session.");
            return false;
        }

        const nowIso = new Date().toISOString();

        // Insert Injury to Supabase
        const { data: insertedInjury, error: injError } = await supabase
            .from('injuries')
            .insert({
                user_id: session.user.id,
                type: data.type,
                body_part: data.bodyPart,
                cause: data.cause,
                status: 'healing',
                start_date: nowIso
            })
            .select('*')
            .single();

        if (injError || !insertedInjury) {
            console.error("Failed to save injury:", injError);
            return false;
        }

        // Insert Log
        const { data: insertedLog, error: logError } = await supabase
            .from('logs')
            .insert({
                injury_id: insertedInjury.id,
                date: nowIso,
                image_url: initialLog.imageUrl,
                pain_level: initialLog.painLevel,
                notes: initialLog.notes,
                temperature: initialLog.temperature,
                symptoms: initialLog.symptoms,
                treatments: initialLog.treatments,
                activity_level: initialLog.activityLevel
            })
            .select('*')
            .single();

        if (logError || !insertedLog) {
            console.error("Failed to save log:", logError);
            // Best-effort rollback so we do not leave orphan injuries without their initial log.
            await supabase.from("injuries").delete().eq("id", insertedInjury.id);
            return false;
        }

        const mappedInjury = mapDbInjury(insertedInjury as DbInjuryRow, [mapDbLog(insertedLog as DbLogRow)]);
        setInjuries((prev) => [mappedInjury, ...prev]);
        return true;
    };

    const addLogToInjury = async (injuryId: string, logData: Omit<InjuryLog, "id" | "date" | "injuryId">): Promise<boolean> => {
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
            return true;
        }

        if (!session?.user?.id) {
            console.error("Cannot add log without an authenticated session.");
            return false;
        }

        const nowIso = new Date().toISOString();

        // Insert to Supabase
        const { data: insertedLog, error } = await supabase
            .from('logs')
            .insert({
                injury_id: injuryId,
                date: nowIso,
                image_url: logData.imageUrl,
                pain_level: logData.painLevel,
                notes: logData.notes,
                temperature: logData.temperature,
                symptoms: logData.symptoms,
                treatments: logData.treatments,
                activity_level: logData.activityLevel
            })
            .select('*')
            .single();

        if (error || !insertedLog) {
            console.error("Failed to add log:", error);
            return false;
        }

        const mappedLog = mapDbLog(insertedLog as DbLogRow);
        setInjuries((prev) =>
            prev.map((inj) =>
                inj.id === injuryId ? { ...inj, logs: [...inj.logs, mappedLog] } : inj
            )
        );
        return true;
    };

    useEffect(() => {
        if (!isSupabaseConfigured) {
            queueMicrotask(() => {
                void fetchInjuries();
            });
            return;
        }

        supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
            setSession(initialSession);
            if (initialSession) {
                await syncOfflineData(initialSession.user.id);
                await fetchInjuries(initialSession.user.id);
                return;
            }
            await fetchInjuries();
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
            setSession(currentSession);
            if (currentSession) {
                await syncOfflineData(currentSession.user.id);
                await fetchInjuries(currentSession.user.id);
                return;
            }
            await fetchInjuries();
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (isSupabaseConfigured) return;
        localStorage.setItem("injury-data", JSON.stringify(injuries));
    }, [injuries]);

    const getInjury = (id: string) => injuries.find((i) => i.id === id);

    const getStreak = () => {
        // Collect all unique log dates
        const allDates = new Set<string>();
        injuries.forEach(inj => {
            inj.logs.forEach(log => {
                allDates.add(new Date(log.date).toDateString());
            });
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
        const currentCheck = new Date();
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
