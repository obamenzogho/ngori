"use client";

import { useState, useMemo } from 'react';
import Hero from './Hero';
import StatsCounters from './StatsCounters';
import { Card } from './ui/Card';
import { Music, Radio, Monitor, Smartphone, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { truncateText, normalizeName } from '@/lib/formatters';
import { useSearch } from '@/app/context/SearchContext';

export type PlaylistItem = {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  category?: string;
  createdAt?: string;
};

export type XtreamItem = {
  _id: string;
  title: string;
  description?: string;
  serverUrl: string;
  username: string;
  category?: string;
  isActive?: boolean;
  createdAt?: string;
};

export type MacPortalItem = {
  _id: string;
  title: string;
  description?: string;
  macAddress?: string;
  category?: string;
  createdAt?: string;
};

export type PublicAppItem = {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  version?: string;
  fileSize?: string;
  rating?: string;
  createdAt?: string;
};

export type ContentResponse = {
  playlists: PlaylistItem[];
  xtreamCodes: XtreamItem[];
  macPortals: MacPortalItem[];
  appItems: PublicAppItem[];
};

export default function HomePageClient({
  initialContent,
  loadError,
}: {
  initialContent: ContentResponse;
  loadError?: string | null;
}) {
  const { searchQuery, setSearchQuery } = useSearch();
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'channels'>('date');
  const [filterType, setFilterType] = useState<'all' | 'm3u' | 'xtream' | 'mac' | 'apps'>('all');

  // Stats calculation
  const stats = {
    playlists: initialContent.playlists.length,
    xtream: initialContent.xtreamCodes.length,
    mac: initialContent.macPortals.length,
    apps: initialContent.appItems.length,
  };

  // Search and Filter Logic
  const filteredContent = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    const filterFn = (item: any) => {
      const title = (item.title || item.name || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      return title.includes(query) || desc.includes(query);
    };

    const sortFn = (a: any, b: any) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'channels') {
        // Only makes sense for M3U, but we handle it generically
        const countA = (a.content || '').split('\n').length;
        const countB = (b.content || '').split('\n').length;
        return countB - countA;
      }
      const nameA = (a.title || a.name || '').toLowerCase();
      const nameB = (b.title || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    };

    return {
      playlists: initialContent.playlists.filter(filterFn).sort(sortFn),
      xtreamCodes: initialContent.xtreamCodes.filter(filterFn).sort(sortFn),
      macPortals: initialContent.macPortals.filter(filterFn).sort(sortFn),
      appItems: initialContent.appItems.filter(filterFn).sort(sortFn),
    };
  }, [initialContent, searchQuery, sortBy]);

  return (
    <div className="pb-20">
      <Hero />
      <StatsCounters stats={stats} />

      <div className="container mx-auto px-4">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between sticky top-20 z-30 bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-border">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
            <input
              type="text"
              placeholder="Rechercher une playlist, une app..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="linear-input pl-10 h-10 w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-surface rounded-lg p-1 border border-border">
              <button
                onClick={() => setSortBy('date')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  sortBy === 'date' ? "bg-primary text-white" : "text-foreground-secondary hover:text-foreground"
                )}
              >
                Date
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  sortBy === 'name' ? "bg-primary text-white" : "text-foreground-secondary hover:text-foreground"
                )}
              >
                Nom
              </button>
              <button
                onClick={() => setSortBy('channels')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  sortBy === 'channels' ? "bg-primary text-white" : "text-foreground-secondary hover:text-foreground"
                )}
              >
                Chaînes
              </button>
            </div>

            <div className="flex items-center gap-2 bg-surface rounded-lg p-1 border border-border">
              {(['all', 'm3u', 'xtream', 'mac', 'apps'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type);
                    if (type !== 'all') {
                      document.getElementById(type === 'apps' ? 'apps' : type)?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all uppercase",
                    filterType === type ? "bg-primary text-white" : "text-foreground-secondary hover:text-foreground"
                  )}
                >
                  {type === 'all' ? 'Tous' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-20">
          
          {/* M3U Section */}
          {(filterType === 'all' || filterType === 'm3u') && (
            <section id="m3u" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Music size={24} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Playlists M3U</h2>
              <span className="ml-auto text-sm text-foreground-secondary">{filteredContent.playlists.length} résultats</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.playlists.map((item) => (
                <Card
                  key={item._id}
                  href={`/playlist/${item._id}`}
                  type="m3u"
                  title={normalizeName(item.title, item.createdAt)}
                  subtitle={truncateText(item.description || '', 150)}
                  image={item.logo}
                  icon={<Music size={24} />}
                  dateStr={item.createdAt}
                  status={true}
                />
              ))}
            </div>
          </section>
          )}

          {/* Xtream Section */}
          {(filterType === 'all' || filterType === 'xtream') && (
            <section id="xtream" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-green-500/10 text-green-400 rounded-lg">
                <Radio size={24} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Accès Xtream</h2>
              <span className="ml-auto text-sm text-foreground-secondary">{filteredContent.xtreamCodes.length} résultats</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.xtreamCodes.map((item) => (
                <Card
                  key={item._id}
                  href={`/xtream/${item._id}`}
                  type="xtream"
                  title={item.title}
                  subtitle={item.serverUrl}
                  icon={<Radio size={24} />}
                  dateStr={item.createdAt}
                  status={item.isActive ?? true}
                />
              ))}
            </div>
          </section>
          )}

          {/* Mac Portal Section */}
          {(filterType === 'all' || filterType === 'mac') && (
            <section id="mac-portal" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
                <Monitor size={24} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Portails Mac</h2>
              <span className="ml-auto text-sm text-foreground-secondary">{filteredContent.macPortals.length} résultats</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.macPortals.map((item) => (
                <Card
                  key={item._id}
                  href={`/mac-portal/${item._id}`}
                  type="mac"
                  title={item.title}
                  subtitle={item.macAddress}
                  icon={<Monitor size={24} />}
                  dateStr={item.createdAt}
                  status={true}
                />
              ))}
            </div>
          </section>
          )}

          {/* Apps Section */}
          {(filterType === 'all' || filterType === 'apps') && (
            <section id="apps" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <Smartphone size={24} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Applications</h2>
              <span className="ml-auto text-sm text-foreground-secondary">{filteredContent.appItems.length} résultats</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.appItems.map((item) => (
                <Card
                  key={item._id}
                  href={`/app/${item._id}`}
                  type="app"
                  title={item.name}
                  subtitle={truncateText(item.description || '', 150)}
                  image={item.icon}
                  icon={<Smartphone size={24} />}
                  dateStr={item.createdAt}
                  bottomContent={
                    <div className="flex items-center justify-between text-xs text-foreground-muted">
                      <span>{item.version || 'v1.0'}</span>
                      <span>{item.fileSize && item.fileSize !== 'N/A' ? item.fileSize : 'N/A'}</span>
                    </div>
                  }
                />
              ))}
            </div>
          </section>
          )}

        </div>
      </div>
    </div>
  );
}
