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
  title: 'Ngori - Plateforme de contenus iptv',
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
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6216012186493058"
          crossOrigin="anonymous"
        ></script>
        {/* Adsterra Core */}
        <script
          async
          src="https://cdn.adsterra.com/core.min.js"
          data-api-key="c7a6e431481df2441d81515a7587c294"
          crossOrigin="anonymous"
        ></script>
        {/* Adsterra Native Banner */}
        <script src="https://pl29139984.profitablecpmratenetwork.com/f1/46/2a/f1462a426ab63b1de2664d62bd5160c7.js"></script>
      </head>
      <body className="min-h-full flex flex-col bg-slate-900 text-white">
        {children}
      </body>
    </html>
  );
}