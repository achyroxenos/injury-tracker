export async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
}

export function sendLocalNotification(title: string, options?: NotificationOptions) {
    if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
    }

    // Use Service Worker if available (better for mobile) 
    // or fallback to standard browser notification
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                icon: '/icon.png', // Fallback icon path (you should ensure this exists in public/ or configure Next.js PWA)
                ...options
            });
        });
    } else {
        new Notification(title, {
            icon: '/icon.png',
            ...options
        });
    }
}

// A simple utility to check if we should nudge the user today
export function checkAndTriggerDailyNudge(
    lastLogDate: string | null,
    activeInjuriesCount: number
) {
    if (activeInjuriesCount === 0) return; // Nothing to log

    const today = new Date().toDateString();

    // Check if we've already nudged them today to prevent spam
    const lastNudge = localStorage.getItem('last-nudge-date');
    if (lastNudge === today) {
        return;
    }

    // If they haven't logged today, or have no logs at all yet for an active injury
    const needsLog = !lastLogDate || new Date(lastLogDate).toDateString() !== today;

    if (needsLog) {
        // Trigger notification
        sendLocalNotification("Time to check in! 🩺", {
            body: "Don't break your streak! Take 10 seconds to update your recovery progress.",
            tag: "daily-nudge",
            requireInteraction: true // Keep it on screen until they interact
        });

        // Record that we nudged them today
        localStorage.setItem('last-nudge-date', today);
    }
}
