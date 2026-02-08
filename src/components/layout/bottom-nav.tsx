import Link from "next/link";
import { Home, PlusCircle, MessageSquare, User, Lock, BriefcaseMedical } from "lucide-react";

export function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t glass bg-background/80 pb-safe pt-2 z-50">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                <NavLink href="/" icon={<Home className="w-6 h-6" />} label="Home" />
                <Link href="/log" className="flex flex-col items-center justify-center -mt-8">
                    <div className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:scale-105 transition-transform">
                        <PlusCircle className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-medium mt-1 text-primary">Log</span>
                </Link>
                <NavLink href="/chat" icon={<MessageSquare className="w-6 h-6" />} label="Ask AI" />
                <NavLink href="/supplies" icon={<BriefcaseMedical className="w-5 h-5" />} label="Kit" />
                <NavLink href="/gallery" icon={<Lock className="w-5 h-5" />} label="Private" />
            </div>
        </nav>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link href={href} className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors p-2">
            {icon}
            <span className="text-[10px] font-medium mt-1">{label}</span>
        </Link>
    );
}
