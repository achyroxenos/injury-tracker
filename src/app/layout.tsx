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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, "font-sans antialiased bg-secondary/30 min-h-screen pb-24")}>
        <InjuryProvider>
          <Header />
          <main className="max-w-md mx-auto px-4 py-6 min-h-[calc(100vh-8rem)]">
            {children}
          </main>
          <BottomNav />
        </InjuryProvider>
      </body>
    </html>
  );
}
