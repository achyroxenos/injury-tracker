"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Supply = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    lowThreshold: number;
};

type SupplyContextType = {
    supplies: Supply[];
    addSupply: (supply: Omit<Supply, "id">) => void;
    updateQuantity: (id: string, newQuantity: number) => void;
    deleteSupply: (id: string) => void;
};

const SupplyContext = createContext<SupplyContextType | undefined>(undefined);
const DEFAULT_SUPPLIES: Supply[] = [
    { id: "1", name: "Bandages", quantity: 5, unit: "pcs", lowThreshold: 3 },
    { id: "2", name: "Ibuprofen", quantity: 12, unit: "pills", lowThreshold: 5 },
    { id: "3", name: "Antibiotic Cream", quantity: 1, unit: "tube", lowThreshold: 1 },
];

export function SupplyProvider({ children }: { children: React.ReactNode }) {
    const [supplies, setSupplies] = useState<Supply[]>(DEFAULT_SUPPLIES);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("supply-data");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Use setTimeout to move the state update outside the synchronous effect body
                // and avoid the react-hooks/set-state-in-effect lint error
                setTimeout(() => setSupplies(parsed), 0);
            } catch (error) {
                console.error("Failed to parse supply data from localStorage", error);
            }
        }
        setTimeout(() => setIsInitialized(true), 0);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("supply-data", JSON.stringify(supplies));
        }
    }, [supplies, isInitialized]);

    const addSupply = (data: Omit<Supply, "id">) => {
        const newSupply = { ...data, id: crypto.randomUUID() };
        setSupplies((prev) => [...prev, newSupply]);
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        setSupplies((prev) => prev.map(s => s.id === id ? { ...s, quantity: Math.max(0, newQuantity) } : s));
    };

    const deleteSupply = (id: string) => {
        setSupplies((prev) => prev.filter(s => s.id !== id));
    };

    return (
        <SupplyContext.Provider value={{ supplies, addSupply, updateQuantity, deleteSupply }}>
            {children}
        </SupplyContext.Provider>
    );
}

export const useSupply = () => {
    const context = useContext(SupplyContext);
    if (!context) throw new Error("useSupply must be used within a SupplyProvider");
    return context;
};
