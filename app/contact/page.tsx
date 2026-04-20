"use client";

import { useState } from 'react';
import { Send, Mail, User, MessageSquare, SendHorizontal, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Breadcrumbs from './components/ui/Breadcrumbs';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      toast.success('Message envoyé avec succès !');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumbs items={[{ label: 'Contact' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-4">Contactez Ngori</h1>
            <p className="text-lg text-foreground-secondary">
              Une question ? Un signalement ? Notre équipe est à votre écoute. 
              Remplissez le formulaire ou rejoignez-nous sur nos réseaux.
            </p>
          </div>

          <div className="space-y-6">
            <div className="linear-card p-6 flex items-center gap-4 hover:border-primary/50 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <SendHorizontal size={24} />
              </div>
              <div>
                <h4 className="font-bold">Telegram</h4>
                <p className="text-sm text-foreground-secondary text-primary">@NgoriOfficial</p>
              </div>
            </div>

            <div className="linear-card p-6 flex items-center gap-4 hover:border-primary/50 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[#5865F2]/10 text-[#5865F2] flex items-center justify-center">
                <MessageCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold">Discord</h4>
                <p className="text-sm text-foreground-secondary text-[#5865F2]">Rejoindre le serveur</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="linear-card p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Nom</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={16} />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Votre nom"
                    className="linear-input pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={16} />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="votre@email.com"
                    className="linear-input pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Sujet</label>
              <input
                required
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="De quoi s'agit-il ?"
                className="linear-input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Message</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-foreground-muted" size={16} />
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Votre message ici..."
                  className="linear-input pl-10 pt-2 min-h-[150px]"
                />
              </div>
            </div>

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full linear-btn linear-btn-primary py-4 font-bold disabled:opacity-50"
            >
              <Send size={18} className="mr-2" />
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
