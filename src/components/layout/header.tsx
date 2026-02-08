import Link from "next/link";
import { Activity } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-40 w-full glass border-b bg-background/80">
            <div className="flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 max-w-md mx-auto px-6">
                <Link href="/" className="flex gap-2 items-center">
                    <Activity className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg inline-block">HealTrace</span>
                </Link>
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-secondary-foreground border">
                        JD
                    </div>
                </div>
            </div>
        </header>
    );
}
