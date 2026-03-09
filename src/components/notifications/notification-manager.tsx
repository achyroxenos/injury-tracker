"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { useInjury } from "@/context/injury-context";
import { requestNotificationPermission, checkAndTriggerDailyNudge } from "@/lib/notifications";

export function NotificationManager() {
    const { injuries } = useInjury();
    const isSupported = typeof window !== "undefined" && "Notification" in window;
    const [permission, setPermission] = useState<NotificationPermission>(
        isSupported ? Notification.permission : "default"
    );

    // Run the nudge check when the component mounts (app launch)
    useEffect(() => {
        if (permission === 'granted') {
            const activeInjuries = injuries.filter(i => !i.archived);

            // Find the absolute latest log across all active injuries
            let latestGlobalDate: string | null = null;
            activeInjuries.forEach(injury => {
                if (injury.logs.length > 0) {
                    const lastLog = injury.logs[injury.logs.length - 1];
                    if (!latestGlobalDate || new Date(lastLog.date) > new Date(latestGlobalDate)) {
                        latestGlobalDate = lastLog.date;
                    }
                } else if (!latestGlobalDate || new Date(injury.startDate) > new Date(latestGlobalDate)) {
                    // If no logs, fallback to start date
                    latestGlobalDate = injury.startDate;
                }
            });

            checkAndTriggerDailyNudge(latestGlobalDate, activeInjuries.length);
        }
    }, [permission, injuries]);

    const handleRequestPermission = async () => {
        if (!isSupported) {
            alert("Notifications are not supported in this browser.");
            return;
        }

        const granted = await requestNotificationPermission();
        setPermission(granted ? "granted" : "denied");
    };

    if (!isSupported) return null;

    return (
        <div className="bg-card border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {permission === "granted" ? (
                    <Bell className="w-5 h-5 text-primary" />
                ) : (
                    <BellOff className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                    <h3 className="font-bold text-sm">Smart Reminders</h3>
                    <p className="text-xs text-muted-foreground">
                        {permission === "granted"
                            ? "Notifications enabled"
                            : permission === "denied"
                                ? "Notifications blocked"
                                : "Get reminders to log updates"}
                    </p>
                </div>
            </div>

            {permission !== "granted" && permission !== "denied" && (
                <button
                    onClick={handleRequestPermission}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold"
                >
                    Enable
                </button>
            )}
        </div>
    );
}
