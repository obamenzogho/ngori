import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: 'Ngori - Plateforme de contenus IPTV',
  description: 'Partagez playlists M3U, acces Xtream, portails Mac et applications',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-adsense-account" content="ca-pub-6216012186493058" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F5F7FF] text-[#1a1a2e]">
        {children}
      </body>
    </html>
  );
}
