"use client";

import { Download, Smartphone, Star, Box, Info, ArrowLeft, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Breadcrumbs from './ui/Breadcrumbs';
import { stripHtml } from '@/lib/formatters';
import { motion } from 'framer-motion';
import { trackClick } from '@/lib/tracker';

type AppDetail = {
  _id: string;
  name: string;
  description?: string;
  downloadUrl: string;
  icon?: string;
  rating?: string;
  version?: string;
  fileSize?: string;
  category?: string;
  createdAt?: string;
};

export default function AppDetailClient({ app }: { app: AppDetail }) {
  const cleanDescription = stripHtml(app.description || '');

  const handleDownload = () => {
    trackClick('app_download_detail', app.name);
    toast.success('Redirection vers le téléchargement...');
    
    // Simulate redirection or actual download
    setTimeout(() => {
      window.open(app.downloadUrl, '_blank', 'noopener,noreferrer');
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumbs items={[{ label: 'Applications', href: '/#apps' }, { label: app.name }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="linear-card p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-surface border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                {app.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
                ) : (
                  <Smartphone size={48} className="text-primary" />
                )}
              </div>
              <div className="flex-grow">
                <h1 className="text-3xl font-bold text-foreground mb-2">{app.name}</h1>
                <div className="flex flex-wrap gap-3">
                  {app.category && (
                    <span className="linear-badge bg-primary/10 text-primary border-primary/20">
                      {app.category}
                    </span>
                  )}
                  {app.rating && app.rating !== 'N/A' && (
                    <span className="linear-badge bg-warning/10 text-warning border-warning/20 flex items-center gap-1">
                      <Star size={12} className="fill-warning" />
                      {app.rating}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Info size={18} className="text-primary" />
                Description
              </h3>
              <div className="text-foreground-secondary leading-relaxed whitespace-pre-wrap">
                {cleanDescription || "Aucune description détaillée disponible pour cette application."}
              </div>
            </div>

            <div className="mt-10">
              <button 
                onClick={handleDownload}
                className="w-full md:w-auto linear-btn linear-btn-primary py-4 px-12 text-base font-bold shadow-[0_0_20px_rgba(108,99,255,0.4)]"
              >
                <Download size={20} className="mr-2" />
                Télécharger maintenant
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="linear-card p-6"
          >
            <h4 className="font-bold mb-6">Détails techniques</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-foreground-muted flex items-center gap-2">
                  <Box size={14} /> Version
                </span>
                <span className="text-sm font-medium text-foreground">{app.version || 'v1.0'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-foreground-muted flex items-center gap-2">
                  <Smartphone size={14} /> Taille
                </span>
                <span className="text-sm font-medium text-foreground">{app.fileSize && app.fileSize !== 'N/A' ? app.fileSize : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-foreground-muted flex items-center gap-2">
                  <ExternalLink size={14} /> Plateforme
                </span>
                <span className="text-sm font-medium text-foreground">Android</span>
              </div>
            </div>
          </motion.div>

          <div className="linear-card p-6 bg-primary/5 border-primary/20">
            <h4 className="font-bold text-primary mb-2">Sécurité</h4>
            <p className="text-xs text-foreground-secondary">
              Toutes nos applications sont vérifiées pour garantir une expérience sans virus ni malware.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
