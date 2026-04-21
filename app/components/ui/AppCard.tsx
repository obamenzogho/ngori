"use client";

import Link from 'next/link';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppCardProps {
  id: string;
  name: string;
  icon?: string;
  rating?: string | number;
  className?: string;
}

const StarRating = ({ rating }: { rating: string | number }) => {
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  if (isNaN(numRating)) return null;

  const fullStars = Math.floor(numRating);
  const hasHalfStar = numRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5 mt-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={12} className="fill-[#FACC15] text-[#FACC15]" />
      ))}
      {hasHalfStar && <StarHalf size={12} className="fill-[#FACC15] text-[#FACC15]" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={12} className="text-foreground-muted" />
      ))}
      <span className="text-[11px] text-foreground-secondary ml-1 mt-0.5">{numRating}</span>
    </div>
  );
};

export default function AppCard({ id, name, icon, rating, className }: AppCardProps) {
  return (
    <Link 
      href={`/app/${id}`}
      className={cn(
        "flex flex-col gap-2 w-[160px] md:w-[180px] group transition-all duration-300 hover:scale-[1.03]",
        className
      )}
    >
      <div className="relative aspect-square w-20 h-20 md:w-24 md:h-24 mx-auto md:mx-0 rounded-2xl overflow-hidden bg-surface border border-white/5 shadow-sm group-hover:shadow-xl group-hover:shadow-primary/10 transition-shadow">
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={icon} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-background-elevated text-foreground-muted">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="12" cy="12" r="3"/><path d="M7 7h10M7 17h10"/></svg>
          </div>
        )}
      </div>
      <div className="flex flex-col px-1">
        <h3 className="text-[14px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {name}
        </h3>
        {rating && <StarRating rating={rating} />}
      </div>
    </Link>
  );
}
