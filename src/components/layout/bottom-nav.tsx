"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, MessageSquare, Lock, BriefcaseMedical } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t glass dark:glass-dark bg-background/80 pb-safe pt-2 z-50">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2 pb-2">
                <NavLink href="/" icon={<Home className="w-6 h-6" />} label="Home" isActive={pathname === "/"} />
                <NavLink href="/chat" icon={<MessageSquare className="w-6 h-6" />} label="Ask UI" isActive={pathname === "/chat"} />

                <Link href="/log" className="flex flex-col items-center justify-center -mt-8 mx-2 group">
                    <div className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg group-hover:scale-110 group-active:scale-95 transition-all duration-300 ease-in-out ring-4 ring-background">
                        <PlusCircle className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-semibold mt-1.5 text-primary">Log</span>
                </Link>

                <NavLink href="/supplies" icon={<BriefcaseMedical className="w-6 h-6" />} label="Kit" isActive={pathname === "/supplies"} />
                <NavLink href="/gallery" icon={<Lock className="w-6 h-6" />} label="Private" isActive={pathname === "/gallery"} />
            </div>
        </nav>
    );
}

function NavLink({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex flex-col items-center justify-center p-2 min-w-[64px] transition-all duration-300 ease-in-out rounded-lg",
                isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
        >
            <div className={cn(
                "transition-transform duration-300",
                isActive ? "scale-110 mb-1" : "scale-100"
            )}>
                {icon}
            </div>
            <span className={cn(
                "text-[10px] transition-all duration-300",
                isActive ? "font-bold opacity-100" : "font-medium opacity-80"
            )}>
                {label}
            </span>
        </Link>
    );
}
