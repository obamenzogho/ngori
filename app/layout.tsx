import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import AdBlockDetector from "./components/AdBlockDetector";
import AnalyticsTracker from "./components/AnalyticsTracker";
import NotificationGate from "./components/NotificationGate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Ngori — Plateforme IPTV',
  description: 'Partagez playlists M3U, accès Xtream, portails Mac et applications',
  icons: {
    icon: '/logo.png?v=3',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head />
      <body className="min-h-full flex flex-col bg-[#0A0A0F] text-[#E8E8ED]" suppressHydrationWarning={true}>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <NotificationGate />
        <AdBlockDetector>
          {children}
        </AdBlockDetector>
      </body>
    </html>
  );
}
