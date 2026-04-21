"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { isNewItem } from '@/lib/formatters';

interface BadgeProps {
  type: 'm3u' | 'xtream' | 'mac' | 'app';
}

const getBadgeStyles = (type: BadgeProps['type']) => {
  switch (type) {
    case 'm3u':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'xtream':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'mac':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'app':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  }
};

const getBadgeLabel = (type: BadgeProps['type']) => {
  switch (type) {
    case 'm3u': return 'M3U';
    case 'xtream': return 'Xtream';
    case 'mac': return 'Mac Portal';
    case 'app': return 'Application';
  }
};

export const CardBadge = ({ type }: BadgeProps) => {
  return (
    <span className={cn('linear-badge border px-2 py-0.5 rounded-full text-[10px]', getBadgeStyles(type))}>
      {getBadgeLabel(type)}
    </span>
  );
};

interface CardProps {
  href: string;
  type: BadgeProps['type'];
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  image?: string;
  dateStr?: string | Date;
  status?: boolean; // true = active, false = inactive
  bottomContent?: ReactNode;
}

export function Card({ href, type, title, subtitle, icon, image, dateStr, status, bottomContent }: CardProps) {
  const isNew = isNewItem(dateStr);

  return (
    <Link href={href} className="block group">
      <div className="linear-card h-full flex flex-col p-4 relative overflow-hidden transition-all hover:bg-background-elevated hover:border-primary/40">
        
        {/* NEW Badge */}
        {isNew && (
          <div className="absolute -right-8 top-4 rotate-45 bg-success text-[#0F0F1A] text-[10px] font-bold py-1 px-10 shadow-lg z-10">
            NOUVEAU
          </div>
        )}

        {/* Header (Icon/Image & Type Badge) */}
        <div className="flex items-start justify-between mb-4">
          <div className="h-12 w-12 rounded-xl bg-surface flex items-center justify-center overflow-hidden border border-border">
            {image ? (
               // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="text-primary">{icon}</div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <CardBadge type={type} />
            {status !== undefined && (
              <span className={cn('text-[10px] font-medium flex items-center gap-1', status ? 'text-success' : 'text-error')}>
                <span className={cn('w-1.5 h-1.5 rounded-full', status ? 'bg-success' : 'bg-error')}></span>
                {status ? 'Actif' : 'Expiré'}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-foreground-secondary line-clamp-2 mb-3">
              {subtitle}
            </p>
          )}
        </div>

        {/* Bottom Area */}
        {bottomContent && (
          <div className="mt-auto pt-3 border-t border-border/50">
            {bottomContent}
          </div>
        )}
      </div>
    </Link>
  );
}
