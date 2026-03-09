"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const PUBLIC_PATHS = new Set(["/login"]);

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(isSupabaseConfigured);

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        let isMounted = true;

        const syncRouteWithSession = (currentPath: string, session: Session | null) => {
            if (!isMounted) return;

            const isPublicPath = PUBLIC_PATHS.has(currentPath);
            if (!session && !isPublicPath) {
                setIsChecking(true);
                router.replace("/login");
                return;
            }

            if (session && currentPath === "/login") {
                setIsChecking(true);
                router.replace("/");
                return;
            }

            setIsChecking(false);
        };

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            syncRouteWithSession(pathname, session);
        };

        void checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            syncRouteWithSession(pathname, currentSession);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [pathname, router]);

    if (isChecking) {
        return null;
    }

    return <>{children}</>;
}
