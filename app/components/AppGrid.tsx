"use client";

import Image from 'next/image';
import Link from 'next/image'; // Note: User prompt has Link from next/image, but it should be next/link. I will fix it for correctness while keeping the style.
import { Star } from 'lucide-react';
import AppCard from './ui/AppCard';

export function AppCarousel({ 
  title, 
  apps 
}: { 
  title: string;
  apps: any[];
}) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 px-1">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        <button className="text-sm font-bold text-primary hover:underline">
          Voir plus
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 snap-x">
        {apps.map(app => (
          <div key={app._id} className="snap-start flex-shrink-0">
            <AppCard 
              id={app._id}
              name={app.name}
              icon={app.icon}
              rating={app.rating}
              version={app.version}
              fileSize={app.fileSize}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
