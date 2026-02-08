"use client";

import React, { useState, useEffect } from "react";
import { Lock, Unlock, Eye, EyeOff, Activity } from "lucide-react";
import { useInjury } from "@/context/injury-context";
import { Card, CardContent } from "@/components/ui/card";

export function IncognitoGallery() {
    const { injuries } = useInjury();
    const [isLocked, setIsLocked] = useState(true);
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");

    // In a real app, this would be a secure hash stored in a safe storage
    const MOCK_PIN = "1234";

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === MOCK_PIN) {
            setIsLocked(false);
            setError("");
        } else {
            setError("Incorrect PIN");
            setPin("");
        }
    };

    const handleLock = () => {
        setIsLocked(true);
        setPin("");
    };

    if (isLocked) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 h-[60vh] animate-in-up">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                    <Lock className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Incognito Gallery</h2>
                    <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                        Enter your PIN to access your sensitive injury photos.
                    </p>
                </div>

                <form onSubmit={handleUnlock} className="w-full max-w-[200px] space-y-4">
                    <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full text-center text-2xl tracking-[1em] p-3 rounded-xl bg-secondary border focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="••••"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}
                    <button
                        type="submit"
                        disabled={pin.length !== 4}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50"
                    >
                        Unlock
                    </button>
                </form>
                <p className="text-xs text-muted-foreground mt-8">Default Mock PIN: 1234</p>
            </div>
        );
    }

    // Get all photos from all injuries
    const allPhotos = injuries.flatMap(injury =>
        injury.logs
            .filter(log => log.imageUrl)
            .map(log => ({ ...log, injuryBodyPart: injury.bodyPart }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6 animate-in-up">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Unlock className="w-6 h-6 text-primary" />
                    Secure Gallery
                </h2>
                <button
                    onClick={handleLock}
                    className="text-xs bg-secondary px-3 py-1.5 rounded-full font-medium active:scale-95 transition-transform"
                >
                    Lock Gallery
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {allPhotos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square border">
                        <img src={photo.imageUrl} alt="Injury" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 flex flex-col justify-end p-3">
                            <span className="text-white text-xs font-bold">{photo.injuryBodyPart}</span>
                            <span className="text-white/70 text-[10px]">{new Date(photo.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {allPhotos.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <EyeOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No photos logged yet.</p>
                </div>
            )}
        </div>
    );
}
