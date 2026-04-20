"use client";

import { useState } from 'react';
import { Copy, Eye, EyeOff, Server, User, Key, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Breadcrumbs from './ui/Breadcrumbs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type XtreamDetail = {
  _id: string;
  category?: string;
  createdAt?: string;
  description?: string;
  expirationDate?: string;
  isActive?: boolean;
  password: string;
  serverUrl: string;
  title: string;
  updatedAt?: string;
  username: string;
};

export default function XtreamDetailClient({ xtream }: { xtream: XtreamDetail }) {
  const [showPassword, setShowPassword] = useState(false);
  const isActive = xtream.isActive ?? (xtream.expirationDate ? new Date(xtream.expirationDate) > new Date() : true);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs items={[{ label: 'Xtream Codes', href: '/#xtream' }, { label: xtream.title }]} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="linear-card p-6 md:p-8"
      >
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {xtream.category && (
            <span className="linear-badge bg-primary/10 text-primary border-primary/20">
              {xtream.category}
            </span>
          )}
          <span className={cn(
            "linear-badge flex items-center gap-1.5",
            isActive ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
          )}>
            {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {isActive ? 'Actif' : 'Expiré'}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4">{xtream.title}</h1>
        <p className="text-foreground-secondary mb-10">
          {xtream.description || "Identifiants Xtream Codes pour votre application IPTV préférée."}
        </p>

        <div className="space-y-6">
          {/* Server URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">URL du serveur</label>
            <div className="flex gap-2">
              <div className="flex-grow flex items-center gap-3 bg-background border border-border p-3 rounded-xl">
                <Server size={18} className="text-primary" />
                <span className="text-sm font-mono text-foreground break-all">{xtream.serverUrl}</span>
              </div>
              <button 
                onClick={() => handleCopy(xtream.serverUrl, 'URL Server')}
                className="p-3 bg-surface hover:bg-background-elevated border border-border rounded-xl transition-all"
                title="Copier URL"
              >
                <Copy size={18} className="text-foreground-secondary" />
              </button>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Nom d'utilisateur</label>
            <div className="flex gap-2">
              <div className="flex-grow flex items-center gap-3 bg-background border border-border p-3 rounded-xl">
                <User size={18} className="text-success" />
                <span className="text-sm font-mono text-foreground">{xtream.username}</span>
              </div>
              <button 
                onClick={() => handleCopy(xtream.username, 'Username')}
                className="p-3 bg-surface hover:bg-background-elevated border border-border rounded-xl transition-all"
                title="Copier Username"
              >
                <Copy size={18} className="text-foreground-secondary" />
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Mot de passe</label>
            <div className="flex gap-2">
              <div className="flex-grow flex items-center gap-3 bg-background border border-border p-3 rounded-xl">
                <Key size={18} className="text-warning" />
                <span className="text-sm font-mono text-foreground">
                  {showPassword ? xtream.password : '••••••••••••'}
                </span>
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-auto text-foreground-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button 
                onClick={() => handleCopy(xtream.password, 'Password')}
                className="p-3 bg-surface hover:bg-background-elevated border border-border rounded-xl transition-all"
                title="Copier Password"
              >
                <Copy size={18} className="text-foreground-secondary" />
              </button>
            </div>
          </div>
        </div>

        {xtream.expirationDate && (
          <div className="mt-10 p-4 bg-background border border-border rounded-xl flex items-center justify-between">
            <span className="text-sm text-foreground-secondary">Expire le :</span>
            <span className="text-sm font-bold text-foreground">{new Date(xtream.expirationDate).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
