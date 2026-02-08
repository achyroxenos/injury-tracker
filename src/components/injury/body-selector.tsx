import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const BODY_PARTS = [
    "Head",
    "Neck",
    "Torso",
    "Back",
    "L. Arm",
    "R. Arm",
    "L. Hand",
    "R. Hand",
    "L. Leg",
    "R. Leg",
    "L. Foot",
    "R. Foot",
];

interface BodySelectorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function BodySelector({ value, onChange, className }: BodySelectorProps) {
    return (
        <div className={cn("grid grid-cols-3 gap-2", className)}>
            {BODY_PARTS.map((part) => (
                <button
                    key={part}
                    type="button"
                    onClick={() => onChange(part)}
                    className={cn(
                        "flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-all border",
                        value === part
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-card hover:bg-secondary text-card-foreground border-border"
                    )}
                >
                    {part}
                    {value === part && <Check className="w-3 h-3 ml-1.5" />}
                </button>
            ))}
        </div>
    );
}
