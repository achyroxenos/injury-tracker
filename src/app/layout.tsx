import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "HealTrace",
  description: "AI-Powered Injury Tracker & Healing Assistant",
};

import { InjuryProvider } from "@/context/injury-context";
import { SupplyProvider } from "@/context/supply-context"; // Added SupplyProvider import

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, "font-sans antialiased bg-secondary/30 min-h-screen pb-24")}>
        <InjuryProvider>
          <SupplyProvider> {/* Wrapped content in SupplyProvider */}
            <Header />
            <main className="max-w-md mx-auto px-4 py-6 min-h-[calc(100vh-8rem)]">
              {children}
            </main>
            <BottomNav />
          </SupplyProvider>
        </InjuryProvider>
      </body>
    </html>
  );
}
