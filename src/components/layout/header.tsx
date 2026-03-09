"use client";

import Link from "next/link";
import { Activity, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
    const [session, setSession] = useState<Session | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <header className="sticky top-0 z-40 w-full glass border-b bg-background/80 no-print">
            <div className="flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 max-w-md mx-auto px-6">
                <Link href="/" className="flex gap-2 items-center group">
                    <Activity className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-black text-lg inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary">
                        HealTrace
                    </span>
                </Link>
                <div className="flex flex-1 items-center justify-end space-x-3">
                    <ThemeToggle />
                    {isSupabaseConfigured ? (
                        session ? (
                            <button onClick={handleSignOut} className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                                <User className="w-4 h-4" />
                                <span>Sign In</span>
                            </Link>
                        )
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-secondary-foreground border">
                            JD
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
