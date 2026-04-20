"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-success/20 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary mb-8"
        >
          <Sparkles size={14} />
          <span className="text-sm font-medium">La plateforme #1 pour votre contenu IPTV</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
        >
          Playlists IPTV, Apps <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#8A2BE2] to-success">
            & bien plus encore
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-foreground-secondary mb-10"
        >
          Accédez gratuitement aux meilleures playlists M3U, connexions Xtream, 
          portails Mac et applications mobiles, centralisés et mis à jour quotidiennement.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/#m3u"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover hover:scale-105 transition-all shadow-[0_0_20px_rgba(108,99,255,0.4)]"
          >
            Voir les playlists
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/#apps"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 rounded-xl border border-border bg-surface text-foreground font-medium hover:bg-background-elevated hover:border-primary/50 transition-all"
          >
            Découvrir les apps
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
