"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const redirectUrl =
        typeof window === "undefined" ? undefined : `${window.location.origin}/`;

    useEffect(() => {
        // Redirect if already logged in
        const checkSession = async () => {
            if (!isSupabaseConfigured) return;
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                router.push("/");
            }
        };

        checkSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
                router.push("/");
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    if (!isSupabaseConfigured) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div className="bg-destructive/10 text-destructive p-4 rounded-xl max-w-md w-full border border-destructive/20 shadow-md">
                    <h2 className="font-bold text-lg mb-2">Supabase Not Configured</h2>
                    <p className="text-sm">Please set your Supabase environment variables to enable authentication.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background elements for premium feel */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-sm glass z-10 p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center animate-in-up">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-rose-500 opacity-20" />
                    <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-rose-500">Heal</span>
                </div>

                <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                <p className="text-sm text-muted-foreground mb-8 text-center">Sign in to sync your recovery progress across all your devices.</p>

                <div className="w-full [&_button]:!rounded-xl [&_input]:!rounded-xl [&_input]:!bg-background/50 [&_input]:!border-white/10 [&_label]:!text-muted-foreground">
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: 'hsl(var(--primary))',
                                        brandAccent: 'hsl(var(--primary))',
                                    }
                                }
                            }
                        }}
                        providers={['google']}
                        redirectTo={redirectUrl}
                    />
                </div>
            </div>
        </div>
    );
}
