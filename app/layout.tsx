import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import AdBlockDetector from "./components/AdBlockDetector";
import AnalyticsTracker from "./components/AnalyticsTracker";
import NotificationGate from "./components/NotificationGate";
import "./globals.css";

import ExoClickVerification from "./components/ExoClickVerification";
import { Providers } from "./components/providers";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import BackToTop from "./components/BackToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Ngori — Playlists M3U, Xtream & Portails Mac IPTV',
    template: '%s | Ngori',
  },
  description:
    'Découvrez gratuitement les meilleures playlists M3U, accès Xtream Codes, portails Mac et applications IPTV mis à jour régulièrement.',
  keywords: [
    'playlist m3u',
    'xtream codes',
    'mac portal',
    'iptv gratuit',
    'm3u 2026',
    'xtream iptv',
    'portail iptv mac',
    'ngori',
  ],
  metadataBase: new URL('https://ngori-rho.vercel.app'),
  openGraph: {
    title: 'Ngori — Playlists M3U, Xtream & Portails Mac IPTV',
    description:
      'Découvrez gratuitement les meilleures playlists M3U, accès Xtream, portails Mac et applications IPTV.',
    url: 'https://ngori-rho.vercel.app',
    siteName: 'Ngori',
    type: 'website',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Ngori' }],
  },
  twitter: {
    card: 'summary',
    title: 'Ngori — Plateforme IPTV Gratuite',
    description:
      'Playlists M3U, accès Xtream, portails Mac et applications IPTV mis à jour régulièrement.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png?v=3',
  },
  verification: {
    google: 'BNEU7OjHFCsF_f_hHjUVSJ5KR9ppm4vWs9OomzqyDF4',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`} suppressHydrationWarning>
      <head>
        <ExoClickVerification />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary-subtle" suppressHydrationWarning>
        <Providers>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          <NotificationGate />
          
          <Navbar />
          
          <main className="flex-grow flex flex-col w-full relative z-10">
            <AdBlockDetector>
              {children}
            </AdBlockDetector>
          </main>

          <Footer />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
