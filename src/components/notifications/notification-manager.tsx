"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

export function NotificationManager() {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if notifications are supported
        if (typeof window !== "undefined" && "Notification" in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!isSupported) {
            alert("Notifications are not supported in this browser.");
            return;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === "granted") {
            // Schedule a test notification
            scheduleReminder("Daily Check-In", "Don't forget to log your recovery progress today!", 10000); // 10 seconds
        }
    };

    const scheduleReminder = (title: string, body: string, delay: number) => {
        setTimeout(() => {
            if (Notification.permission === "granted") {
                new Notification(title, {
                    body,
                    icon: "/icon-192.png", // You can add an icon later
                    badge: "/icon-192.png",
                    tag: "injury-tracker-reminder"
                });
            }
        }, delay);
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
                    onClick={requestPermission}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold"
                >
                    Enable
                </button>
            )}
        </div>
    );
}
