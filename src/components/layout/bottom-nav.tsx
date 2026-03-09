"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, MessageSquare, BarChart3, BriefcaseMedical } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t glass bg-background/80 pb-safe pt-2 z-50 no-print">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2 pb-2">
                <NavLink href="/" icon={<Home className="w-5 h-5" />} label="Home" isActive={pathname === "/"} />
                <NavLink href="/chat" icon={<MessageSquare className="w-5 h-5" />} label="Ask AI" isActive={pathname === "/chat"} />

                <Link href="/log" className="flex flex-col items-center justify-center -mt-8 mx-2 group">
                    <div className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg group-hover:scale-110 group-active:scale-90 transition-all duration-300 ease-out ring-4 ring-background animate-pulse-glow">
                        <PlusCircle className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-semibold mt-1.5 text-primary">Log</span>
                </Link>

                <NavLink href="/supplies" icon={<BriefcaseMedical className="w-5 h-5" />} label="Kit" isActive={pathname === "/supplies"} />
                <NavLink href="/insights" icon={<BarChart3 className="w-5 h-5" />} label="Insights" isActive={pathname === "/insights"} />
            </div>
        </nav>
    );
}

function NavLink({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex flex-col items-center justify-center p-2 min-w-[56px] transition-all duration-300 ease-out rounded-xl active:scale-90",
                isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
            )}
        >
            <div className={cn(
                "transition-all duration-300",
                isActive ? "scale-110 mb-0.5" : "scale-100"
            )}>
                {icon}
            </div>
            <span className={cn(
                "text-[10px] transition-all duration-300",
                isActive ? "font-bold opacity-100" : "font-medium opacity-70"
            )}>
                {label}
            </span>
            {/* Active indicator dot */}
            <div className={cn(
                "w-1 h-1 rounded-full mt-0.5 transition-all duration-300",
                isActive ? "bg-primary scale-100" : "bg-transparent scale-0"
            )} />
        </Link>
    );
}
