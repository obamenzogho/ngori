"use client";

import { useState } from 'react';
import { ChevronDown, Target, Users, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs';

const FAQ_ITEMS = [
  {
    question: "Qu'est-ce que Ngori ?",
    answer: "Ngori est une plateforme agrégatrice de contenus IPTV. Nous centralisons les meilleures playlists M3U, accès Xtream Codes et portails MAC gratuits trouvés sur le web pour faciliter votre expérience de streaming."
  },
  {
    question: "Les playlists sont-elles gratuites ?",
    answer: "Oui, tout le contenu partagé sur Ngori est accessible gratuitement. Nous mettons à jour nos bases de données régulièrement pour garantir la meilleure validité possible."
  },
  {
    question: "Comment utiliser une playlist M3U ?",
    answer: "Vous pouvez utiliser un lecteur IPTV comme VLC, IPTV Smarters Pro, ou TiviMate. Il vous suffit de copier le lien M3U fourni sur notre site et de l'ajouter dans votre application."
  },
  {
    question: "Proposez-vous un abonnement premium ?",
    answer: "Non, Ngori ne vend aucun abonnement. Nous sommes un site de partage gratuit. Si on vous demande de payer sur un site se faisant passer pour nous, soyez vigilant."
  },
  {
    question: "Comment signaler un lien mort ?",
    answer: "Vous pouvez nous contacter via notre page de contact ou rejoindre notre communauté si un lien ne fonctionne plus. Nous faisons de notre mieux pour supprimer les contenus expirés."
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden mb-4 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left transition-colors",
          isOpen ? "bg-primary/5 text-primary" : "bg-surface text-foreground hover:bg-background-elevated"
        )}
      >
        <span className="font-semibold">{question}</span>
        <ChevronDown className={cn("transition-transform duration-300", isOpen ? "rotate-180" : "")} size={20} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 text-sm text-foreground-secondary leading-relaxed border-t border-border bg-background/50">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs items={[{ label: 'À propos' }]} />

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">À propos de Ngori</h1>
        <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
          Votre destination ultime pour centraliser et accéder aux meilleurs ressources IPTV gratuitement.
        </p>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="linear-card p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Target size={24} />
          </div>
          <h3 className="font-bold mb-2">Notre Mission</h3>
          <p className="text-sm text-foreground-secondary">
            Simplifier l'accès aux technologies de streaming en regroupant tout en un seul endroit propre et moderne.
          </p>
        </div>
        <div className="linear-card p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h3 className="font-bold mb-2">Communauté</h3>
          <p className="text-sm text-foreground-secondary">
            Créé par des passionnés pour des utilisateurs du monde entier cherchant des solutions gratuites et efficaces.
          </p>
        </div>
        <div className="linear-card p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold mb-2">Fiabilité</h3>
          <p className="text-sm text-foreground-secondary">
            Bien que nous soyons un agrégateur, nous trions et vérifions les liens pour vous offrir la meilleure qualité possible.
          </p>
        </div>
      </div>

      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle size={28} className="text-primary" />
          <h2 className="text-3xl font-bold">Foire aux questions</h2>
        </div>
        <div className="max-w-3xl">
          {FAQ_ITEMS.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>
    </div>
  );
}
