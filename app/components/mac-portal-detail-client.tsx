"use client";

import { Copy, Monitor, Hash, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Breadcrumbs from './ui/Breadcrumbs';
import { motion } from 'framer-motion';

type MacPortalDetail = {
  _id: string;
  category?: string;
  createdAt?: string;
  description?: string;
  macAddress?: string;
  macIdentifier?: string;
  portalUrl: string;
  title: string;
  updatedAt?: string;
};

export default function MacPortalDetailClient({ portal }: { portal: MacPortalDetail }) {
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs items={[{ label: 'Portails Mac', href: '/#mac-portal' }, { label: portal.title }]} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="linear-card p-6 md:p-8"
      >
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {portal.category && (
            <span className="linear-badge bg-primary/10 text-primary border-primary/20">
              {portal.category}
            </span>
          )}
          <span className="linear-badge bg-success/10 text-success border-success/20 flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            Actif
          </span>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4">{portal.title}</h1>
        <p className="text-foreground-secondary mb-10">
          {portal.description || "Identifiants Mac Portal pour STB Emulator ou MAG Box."}
        </p>

        <div className="space-y-6">
          {/* Portal URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">URL du portail</label>
            <div className="flex gap-2">
              <div className="flex-grow flex items-center gap-3 bg-background border border-border p-3 rounded-xl">
                <Monitor size={18} className="text-primary" />
                <span className="text-sm font-mono text-foreground break-all">{portal.portalUrl}</span>
              </div>
              <button 
                onClick={() => handleCopy(portal.portalUrl, 'URL Portal')}
                className="p-3 bg-surface hover:bg-background-elevated border border-border rounded-xl transition-all"
                title="Copier URL"
              >
                <Copy size={18} className="text-foreground-secondary" />
              </button>
            </div>
          </div>

          {/* MAC Address */}
          {portal.macAddress && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Adresse MAC</label>
              <div className="flex gap-2">
                <div className="flex-grow flex items-center gap-3 bg-background border border-border p-3 rounded-xl">
                  <Hash size={18} className="text-success" />
                  <span className="text-sm font-mono text-foreground">{portal.macAddress}</span>
                </div>
                <button 
                  onClick={() => handleCopy(portal.macAddress || '', 'Adresse MAC')}
                  className="p-3 bg-surface hover:bg-background-elevated border border-border rounded-xl transition-all"
                  title="Copier MAC"
                >
                  <Copy size={18} className="text-foreground-secondary" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
