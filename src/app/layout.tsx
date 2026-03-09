import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "HealTrace",
  description: "AI-Powered Injury Tracker & Healing Assistant",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HealTrace",
  },
};

export const viewport: Viewport = {
  themeColor: "#e11d48",
};

import { InjuryProvider } from "@/context/injury-context";
import { SupplyProvider } from "@/context/supply-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-secondary/30 min-h-screen pb-24">
        <AuthGuard>
          <InjuryProvider>
            <SupplyProvider>
              <Header />
              <main className="max-w-md mx-auto px-4 py-6 min-h-[calc(100vh-8rem)]">
                {children}
              </main>
              <BottomNav />
            </SupplyProvider>
          </InjuryProvider>
        </AuthGuard>
      </body>
    </html>
  );
}
