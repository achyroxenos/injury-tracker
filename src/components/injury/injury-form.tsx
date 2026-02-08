"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Save } from "lucide-react";
import { useInjury } from "@/context/injury-context";
import { BodyMap3D } from "./body-map-3d";
import { cn } from "@/lib/utils";

import { Treatment } from "@/context/injury-context";
import { RangeOfMotion } from "../tools/rom-tester";
import { WoundAreaCalculator } from "../tools/wound-calculator";
import { UploadButton } from "@/lib/uploadthing";

export function InjuryForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const injuryId = searchParams.get("injuryId"); // If present, we are adding a log
    const { injuries, addInjury, addLogToInjury } = useInjury();

    const existingInjury = injuryId ? injuries.find(i => i.id === injuryId) : undefined;

    const [step, setStep] = useState(1);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [logType, setLogType] = useState<"injury" | "illness">("injury");
    const [formData, setFormData] = useState({
        bodyPart: existingInjury?.bodyPart || "",
        cause: existingInjury?.cause || "",
        painLevel: 5,
        details: "",
        temperature: 36.5,
        symptoms: [] as string[],
        treatments: [] as Treatment[],
        activityLevel: "low" as "low" | "medium" | "high",
    });

    const [newTreatment, setNewTreatment] = useState({ name: "", type: "medication" as const });
    const [showROM, setShowROM] = useState(false);
    const [showArea, setShowArea] = useState(false);

    const addTreatment = () => {
        if (!newTreatment.name) return;
        const treatment: Treatment = {
            id: crypto.randomUUID(),
            name: newTreatment.name,
            type: newTreatment.type,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setFormData(prev => ({ ...prev, treatments: [...prev.treatments, treatment] }));
        setNewTreatment({ name: "", type: "medication" });
    };

    const SYMPTOMS = ["Cough", "Sore Throat", "Headache", "Nausea", "Fatigue", "Chills", "Congestion"];

    const toggleSymptom = (sym: string) => {
        setFormData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(sym)
                ? prev.symptoms.filter(s => s !== sym)
                : [...prev.symptoms, sym]
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setStep(2);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (injuryId) {
            // Add log to existing injury
            addLogToInjury(injuryId, {
                imageUrl: imagePreview || undefined,
                painLevel: formData.painLevel,
                notes: formData.details,
                temperature: existingInjury?.type === "illness" ? formData.temperature : undefined,
                symptoms: existingInjury?.type === "illness" ? formData.symptoms : undefined,
                treatments: formData.treatments,
                activityLevel: formData.activityLevel,
            });
            router.push(`/chat?context=${injuryId}`);
        } else {
            // Create new
            addInjury({
                type: logType,
                bodyPart: logType === "illness" ? "General Illness" : formData.bodyPart,
                cause: formData.cause,
            }, {
                imageUrl: imagePreview || undefined,
                painLevel: formData.painLevel,
                notes: formData.details,
                temperature: logType === "illness" ? formData.temperature : undefined,
                symptoms: logType === "illness" ? formData.symptoms : undefined,
                treatments: formData.treatments,
                activityLevel: formData.activityLevel,
            });
            router.push("/");
        }
    };

    return (
        <div className="space-y-6 animate-in-up">
            {/* Progress Stepper - Hide strict steps if updating */}
            {!injuryId && (
                <>
                    <div className="flex bg-secondary p-1 rounded-full mb-6 relative">
                        <button
                            type="button"
                            onClick={() => setLogType("injury")}
                            className={cn("flex-1 py-2 text-sm font-medium rounded-full transition-all z-10", logType === "injury" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
                        >
                            Physical Injury
                        </button>
                        <button
                            type="button"
                            onClick={() => setLogType("illness")}
                            className={cn("flex-1 py-2 text-sm font-medium rounded-full transition-all z-10", logType === "illness" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
                        >
                            Flu / Illness
                        </button>
                    </div>

                    <div className="flex items-center justify-center space-x-2 mb-6">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={cn(
                                    "h-2 rounded-full transition-all duration-300",
                                    s === step ? "w-8 bg-primary" : "w-2 bg-secondary/50",
                                    s < step ? "bg-primary/50" : ""
                                )}
                            />
                        ))}
                    </div>
                </>
            )}

            <form onSubmit={handleSubmit}>
                {/* Step 1: Photo (Always shown first) */}
                {step === 1 && (
                    <div className="space-y-4 text-center">
                        <h2 className="text-2xl font-bold">
                            {injuryId ? "Update Progress" : "Capture the Injury"}
                        </h2>
                        <p className="text-muted-foreground">
                            {injuryId ? "Align with the previous photo." : "Take a clear photo for AI analysis."}
                        </p>

                        <label className="block relative aspect-[4/5] bg-secondary/30 rounded-2xl border-2 border-dashed border-secondary hover:border-primary/50 transition-colors cursor-pointer overflow-hidden flex flex-col items-center justify-center group">
                            {/* Ghost Overlay */}
                            {injuryId && existingInjury?.logs.length ? (
                                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none grayscale">
                                    <img
                                        src={existingInjury.logs[existingInjury.logs.length - 1].imageUrl}
                                        className="w-full h-full object-cover"
                                        alt="Ghost overlay"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 bg-card relative overflow-hidden">
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} className="max-h-[300px] rounded-lg shadow-sm mb-4" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setImagePreview(null)}
                                                        className="text-xs text-destructive font-bold"
                                                    >
                                                        Remove Photo
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="text-center w-full">
                                                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Camera className="w-8 h-8 text-primary" />
                                                    </div>
                                                    <h3 className="font-bold mb-2">Take a Photo</h3>
                                                    <p className="text-xs text-muted-foreground mb-4">
                                                        Ensure good lighting for accurate AI analysis.
                                                    </p>

                                                    <div className="flex justify-center">
                                                        <UploadButton
                                                            endpoint="imageUploader"
                                                            onClientUploadComplete={(res) => {
                                                                if (res && res[0]) {
                                                                    setImagePreview(res[0].url);
                                                                    alert("Upload Completed");
                                                                }
                                                            }}
                                                            onUploadError={(error: Error) => {
                                                                alert(`ERROR! ${error.message}`);
                                                            }}
                                                            appearance={{
                                                                button: "bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg text-sm"
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                        </label>

                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="text-sm text-muted-foreground underline"
                        >
                            Skip photo
                        </button>
                    </div>
                )}

                {/* Step 2: Location (Skip if updating or if Illness) */}
                {step === 2 && !injuryId && logType === "injury" && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-center">Where does it hurt?</h2>
                        {imagePreview && (
                            <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 border-white shadow-lg mb-4">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="relative">
                            <BodyMap3D
                                onPartSelect={(val) => setFormData(prev => ({ ...prev, bodyPart: val }))}
                                selectedPart={formData.bodyPart}
                            />
                        </div>

                        <p className="text-center text-sm font-medium text-primary h-6">
                            {formData.bodyPart ? `Selected: ${formData.bodyPart}` : "Select a body part"}
                        </p>

                        <button
                            type="button"
                            disabled={!formData.bodyPart}
                            onClick={() => setStep(3)}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 mt-8"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step 2 alternative: Illness Details (Skipped for Injury) */}
                {step === 2 && !injuryId && logType === "illness" && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-center">Symptoms</h2>

                        <div className="flex flex-wrap gap-2 justify-center">
                            {SYMPTOMS.map(sym => (
                                <button
                                    key={sym}
                                    type="button"
                                    onClick={() => toggleSymptom(sym)}
                                    className={cn(
                                        "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                                        formData.symptoms.includes(sym)
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-card hover:bg-secondary border-border"
                                    )}
                                >
                                    {sym}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium">Temperature</label>
                                <span className="font-bold text-primary">{formData.temperature}°C</span>
                            </div>
                            <input
                                type="range"
                                min="35"
                                max="42"
                                step="0.1"
                                className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                value={formData.temperature}
                                onChange={e => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setStep(3)}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg shadow-lg mt-8"
                        >
                            Continue
                        </button>
                    </div>
                )}
                {/* Step 3: Details (Or Step 2 if updating) */}
                {(step === 3 || (injuryId && step === 2)) && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-center">Details</h2>

                        {!injuryId && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {logType === "injury" ? "Cause of Injury" : "Diagnosis / Description"}
                                </label>
                                <input
                                    type="text"
                                    placeholder={logType === "injury" ? "e.g., Fell running" : "e.g., Seasonal Flu"}
                                    className="w-full p-4 rounded-xl bg-card border shadow-sm outline-none"
                                    value={formData.cause}
                                    onChange={e => setFormData({ ...formData, cause: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium">
                                    {logType === "injury" ? "Pain Level" : "Overall Discomfort"}
                                </label>
                                <span className="font-bold text-primary">{formData.painLevel}/10</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="1"
                                className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                value={formData.painLevel}
                                onChange={e => setFormData({ ...formData, painLevel: parseInt(e.target.value) })}
                            />
                        </div>

                        {/* Activity Level Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Activity Level Today</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(["low", "medium", "high"] as const).map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, activityLevel: level })}
                                        className={cn(
                                            "py-2 rounded-lg text-xs font-bold capitalize border transition-all",
                                            formData.activityLevel === level
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-card hover:bg-secondary"
                                        )}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ROM Tester for Injuries */}
                        {logType === "injury" && (
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowROM(!showROM)}
                                    className="text-xs text-primary font-bold underline mb-4"
                                >
                                    {showROM ? "Hide Motion Tester" : "+ Add Range of Motion"}
                                </button>

                                {showROM && (
                                    <RangeOfMotion
                                        onSave={(angle) => setFormData(prev => ({ ...prev, details: prev.details + `\nRange of Motion: ${angle}°` }))}
                                    />
                                )}
                            </div>
                        )}

                        {/* Wound Area Calculator (Only if there is an image) */}
                        {logType === "injury" && imagePreview && (
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowArea(!showArea)}
                                    className="text-xs text-primary font-bold underline mb-4"
                                >
                                    {showArea ? "Hide Area Calculator" : "+ Calculate Wound Area"}
                                </button>

                                {showArea && (
                                    <WoundAreaCalculator
                                        imageUrl={imagePreview}
                                        onSave={(area) => {
                                            setFormData(prev => ({ ...prev, details: prev.details + `\nEstimated Area: ${area} cm²` }));
                                            setShowArea(false);
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex justify-between">
                                Notes / Changes
                                <button
                                    type="button"
                                    onClick={() => {
                                        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                                            // Simple mock for the prototype as types are tricky in nextjs without proper setup
                                            const MockSpeech = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
                                            const recognition = new MockSpeech();
                                            recognition.onresult = (e: any) => {
                                                const text = e.results[0][0].transcript;
                                                setFormData(prev => ({ ...prev, details: prev.details + " " + text }));
                                            };
                                            recognition.start();
                                            alert("Listening... speak now.");
                                        } else {
                                            alert("Voice not supported in this browser.");
                                        }
                                    }}
                                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1"
                                >
                                    🎤 Dictate
                                </button>
                            </label>
                            <textarea
                                className="w-full p-4 rounded-xl bg-card border shadow-sm outline-none h-32"
                                placeholder="Describe any changes, pain type, or drainage..."
                                value={formData.details}
                                onChange={e => setFormData({ ...formData, details: e.target.value })}
                            />
                        </div>

                        {/* Medications / Treatments */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-bold text-sm">Medications & Treatments</h3>

                            <div className="flex gap-2">
                                <input
                                    className="flex-1 p-3 rounded-lg bg-card border text-sm"
                                    placeholder="e.g. Ibuprofen, Bandage"
                                    value={newTreatment.name}
                                    onChange={e => setNewTreatment({ ...newTreatment, name: e.target.value })}
                                />
                                <select
                                    className="p-3 rounded-lg bg-card border text-sm"
                                    value={newTreatment.type}
                                    onChange={e => setNewTreatment({ ...newTreatment, type: e.target.value as any })}
                                >
                                    <option value="medication">Pill</option>
                                    <option value="dressing">Bandage</option>
                                    <option value="therapy">Ice/Heat</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={addTreatment}
                                    className="bg-secondary text-secondary-foreground px-4 rounded-lg font-bold"
                                >
                                    +
                                </button>
                            </div>

                            <div className="space-y-2">
                                {formData.treatments.map(t => (
                                    <div key={t.id} className="flex justify-between items-center bg-secondary/50 p-2 rounded-lg text-sm">
                                        <span>{t.type === "medication" ? "💊" : t.type === "dressing" ? "🩹" : "🧊"} <strong>{t.name}</strong></span>
                                        <span className="text-muted-foreground text-xs">{t.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-8"
                        >
                            <Save className="w-5 h-5" />
                            {injuryId ? "Save Update" : "Start Tracking"}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
