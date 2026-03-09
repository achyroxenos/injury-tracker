"use client";

import React, { useState } from "react";
import { Plus, Minus, AlertTriangle } from "lucide-react";
import { useSupply } from "@/context/supply-context";
import { cn } from "@/lib/utils";

export function SupplyManager() {
    const { supplies, updateQuantity, addSupply } = useSupply();
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", quantity: 1, unit: "pcs", lowThreshold: 3 });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name) return;
        addSupply(newItem);
        setNewItem({ name: "", quantity: 1, unit: "pcs", lowThreshold: 3 });
        setIsAdding(false);
    };

    return (
        <div className="space-y-6 animate-in-up">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">First Aid Kit</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-sm"
                >
                    {isAdding ? "Cancel" : "+ Add Item"}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-secondary/30 p-4 rounded-xl space-y-3 border">
                    <input
                        className="w-full p-2 rounded-lg bg-card border text-sm"
                        placeholder="Item Name (e.g. Gauze)"
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            className="w-20 p-2 rounded-lg bg-card border text-sm"
                            placeholder="Qty"
                            value={newItem.quantity}
                            onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                        />
                        <input
                            className="flex-1 p-2 rounded-lg bg-card border text-sm"
                            placeholder="Unit (e.g. pcs)"
                            value={newItem.unit}
                            onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm">
                        Save Item
                    </button>
                </form>
            )}

            <div className="grid gap-3">
                {supplies.map((item) => {
                    const isLow = item.quantity <= item.lowThreshold;
                    return (
                        <div key={item.id} className={cn("flex items-center justify-between p-4 rounded-xl border bg-card transition-all", isLow ? "border-red-500/50 shadow-sm shadow-red-500/10" : "border-border")}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold">{item.name}</h3>
                                    {isLow && (
                                        <span className="flex items-center text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                            <AlertTriangle className="w-3 h-3 mr-1" /> LOW
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Alert at {item.lowThreshold} {item.unit}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/70 active:scale-95"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <div className="w-12 text-center font-bold text-lg">
                                    {item.quantity}
                                </div>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/70 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {supplies.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                        Your kit is empty.
                    </div>
                )}
            </div>
        </div>
    );
}
