"use client";

import { useState } from 'react';
import { ChevronDown, Target, Users, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs';

const FAQ_ITEMS = [
  {
    question: "Qu'est-ce que Ngori ?",
    answer: "Ngori est une plateforme gratuite qui centralise les meilleures playlists M3U, accès Xtream, portails Mac et applications mobiles pour le streaming IPTV."
  },
  {
    question: "Les playlists sont-elles gratuites ?",
    answer: "Oui, toutes les ressources disponibles sur Ngori sont entièrement gratuites et accessibles sans inscription."
  },
  {
    question: "Comment utiliser une playlist M3U ?",
    answer: "Téléchargez la playlist et ouvrez-la avec un lecteur compatible comme VLC, IPTV Smarters Pro ou TiviMate."
  },
  {
    question: "Proposez-vous un abonnement premium ?",
    answer: "Non, Ngori est et restera 100% gratuit. Nous ne proposons aucun abonnement payant."
  },
  {
    question: "Comment signaler un lien mort ?",
    answer: "Utilisez la page Contact pour nous signaler tout lien expiré ou non fonctionnel, nous le corrigerons rapidement."
  }
];

function FAQItem({ 
  question, 
  answer, 
  isOpen, 
  onClick 
}: { 
  question: string; 
  answer: string; 
  isOpen: boolean; 
  onClick: () => void;
}) {
  return (
    <div className={cn(
      "border rounded-xl overflow-hidden mb-4 transition-all duration-300",
      isOpen ? "border-primary/30 shadow-lg shadow-primary/5" : "border-border"
    )}>
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center justify-between p-5 text-left transition-all duration-300",
          isOpen ? "bg-primary/5 text-primary" : "bg-surface text-foreground hover:bg-background-elevated"
        )}
      >
        <span className="font-semibold text-lg">{question}</span>
        <ChevronDown className={cn("transition-transform duration-500", isOpen ? "rotate-180 text-primary" : "text-foreground-muted")} size={20} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-5 text-base text-foreground-secondary leading-relaxed border-t border-border/50 bg-background/50">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AboutPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs items={[{ label: 'À propos' }]} />

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-success">
          À propos de Ngori
        </h1>
        <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
          Votre plateforme gratuite de centralisation IPTV. Nous regroupons le meilleur du web en un seul endroit.
        </p>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="linear-card p-6 flex flex-col items-center text-center group">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Target size={28} />
          </div>
          <h3 className="text-lg font-bold mb-2">Notre Mission</h3>
          <p className="text-sm text-foreground-secondary">
            Simplifier l'accès aux technologies de streaming en regroupant tout en un seul endroit propre et moderne.
          </p>
        </div>
        <div className="linear-card p-6 flex flex-col items-center text-center group">
          <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Users size={28} />
          </div>
          <h3 className="text-lg font-bold mb-2">Gratuité Totale</h3>
          <p className="text-sm text-foreground-secondary">
            Ngori est et restera 100% gratuit. Notre but est le partage communautaire sans contrepartie financière.
          </p>
        </div>
        <div className="linear-card p-6 flex flex-col items-center text-center group">
          <div className="w-14 h-14 rounded-2xl bg-warning/10 text-warning flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck size={28} />
          </div>
          <h3 className="text-lg font-bold mb-2">Vérification</h3>
          <p className="text-sm text-foreground-secondary">
            Nous trions et vérifions les liens régulièrement pour vous offrir la meilleure expérience de streaming possible.
          </p>
        </div>
      </div>

      <section className="mb-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-primary/10 rounded-lg">
            <HelpCircle size={28} className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Foire aux questions</h2>
        </div>
        <div className="max-w-3xl">
          {FAQ_ITEMS.map((faq, index) => (
            <FAQItem 
              key={index} 
              question={faq.question} 
              answer={faq.answer} 
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
