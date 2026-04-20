'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import Footer from './footer';
import { formatDate } from './format-date';
import { IconChevronRight, IconDocument } from './icons';
import Navbar, { type ContentView } from './navbar';
import { trackClick } from '@/lib/tracker';

// ─── Premium Animations Components ───

function ElectricFilaments() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const trailRef = useRef<{ x: number; y: number; id: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setPos(newPos);

      const newTrail = [...trailRef.current, { ...newPos, id: idRef.current++ }];
      if (newTrail.length > 12) newTrail.shift();
      trailRef.current = newTrail;
      setTrail(newTrail);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="electricGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(94,106,210,0)" />
            <stop offset="50%" stopColor="rgba(94,106,210,0.6)" />
            <stop offset="100%" stopColor="rgba(124,107,247,0)" />
          </linearGradient>
          <filter id="electricGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {trail.map((point, i) => {
          const next = trail[i + 1];
          if (!next) return null;
          const opacity = (i / trail.length) * 0.8;
          const width = (i / trail.length) * 3 + 1;
          const midX = (point.x + next.x) / 2;
          const midY = (point.y + next.y) / 2;
          const ctrl1x = point.x + (next.x - point.x) * 0.25 + (Math.random() - 0.5) * 30;
          const ctrl1y = point.y + (next.y - point.y) * 0.25 + (Math.random() - 0.5) * 30;
          const ctrl2x = point.x + (next.x - point.x) * 0.75 + (Math.random() - 0.5) * 30;
          const ctrl2y = point.y + (next.y - point.y) * 0.75 + (Math.random() - 0.5) * 30;
          const path = `M ${point.x} ${point.y} C ${ctrl1x} ${ctrl1y}, ${ctrl2x} ${ctrl2y}, ${next.x} ${next.y}`;
          return (
            <path
              key={point.id}
              d={path}
              stroke="url(#electricGrad)"
              strokeWidth={width}
              fill="none"
              strokeLinecap="round"
              filter="url(#electricGlow)"
              style={{ opacity, animation: 'electricPulse 0.3s ease-out forwards' }}
            />
          );
        })}
        {trail.length > 2 && (
          <circle
            cx={trail[trail.length - 1].x}
            cy={trail[trail.length - 1].y}
            r={6 + Math.random() * 4}
            fill="rgba(94,106,210,0.4)"
            filter="url(#electricGlow)"
            style={{ animation: 'sparkBurst 0.4s ease-out forwards' }}
          />
        )}
      </svg>
      <style>{`
        @keyframes electricPulse {
          0% { stroke-opacity: 1; }
          100% { stroke-opacity: 0; }
        }
        @keyframes sparkBurst {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function createRipple(e: React.MouseEvent<HTMLElement>) {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  const ripple = document.createElement('span');
  ripple.className = 'absolute rounded-full bg-white/10 animate-ripple pointer-events-none';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  target.style.position = 'relative';
  target.style.overflow = 'hidden';
  target.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

const VISITOR_FLAG = 'ngori_visited';

function getHasVisited(): boolean {
  try {
    return localStorage.getItem(VISITOR_FLAG) === 'true';
  } catch {
    return false;
  }
}

function subscribeToHasVisited(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function useHasVisited() {
  return useSyncExternalStore(subscribeToHasVisited, getHasVisited, getHasVisited);
}

// ─── Types ───

type BaseContentItem = {
  _id: string;
  createdAt?: string;
  description?: string;
};

export type PlaylistItem = BaseContentItem & {
  category?: string;
  content: string;
  downloads?: number;
  logo?: string;
  title: string;
  updatedAt?: string;
};

export type XtreamItem = BaseContentItem & {
  category?: string;
  expirationDate?: string;
  password: string;
  serverUrl: string;
  title: string;
  updatedAt?: string;
  username: string;
};

export type MacPortalItem = BaseContentItem & {
  category?: string;
  logo?: string;
  macAddress?: string;
  macIdentifier?: string;
  portalUrl: string;
  title: string;
  updatedAt?: string;
};

export type PublicAppItem = BaseContentItem & {
  downloadUrl: string;
  fileSize?: string;
  name: string;
  version?: string;
  icon?: string;
  rating?: string;
};

export type ContentResponse = {
  appItems: PublicAppItem[];
  macPortals: MacPortalItem[];
  playlists: PlaylistItem[];
  xtreamCodes: XtreamItem[];
};

type FeedItem = {
  createdAt?: string;
  description: string;
  id: string;
  rawData?: PlaylistItem | XtreamItem | MacPortalItem | PublicAppItem;
  title: string;
  type: Exclude<ContentView, 'all'>;
  typeLabel: string;
};

type Notice = {
  message: string;
  tone: 'error' | 'success';
};

// ─── Badge color map (dark mode) ───

const TYPE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  playlists: { bg: 'bg-[#5E6AD2]/15', text: 'text-[#8B93E6]', label: 'M3U' },
  xtreamCodes: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Xtream' },
  macPortals: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Mac Portal' },
  appItems: { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'Application' },
};

// ─── Main Component ───

export default function HomePageClient({
  initialContent,
  loadError,
}: {
  initialContent: ContentResponse;
  loadError?: string | null;
}) {
  const [activeView, setActiveView] = useState<ContentView>('all');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [hasVisitedBefore, setHasVisitedBefore] = useState(true);
  const [content, setContent] = useState<ContentResponse>(initialContent);
  const hasVisitedClient = useHasVisited();

  // Revalidate content on focus/visibility
  useEffect(() => {
    let stale = false;

    async function revalidate() {
      try {
        const res = await fetch('/api/content');
        if (res.ok) {
          const fresh: ContentResponse = await res.json();
          if (!stale) setContent(fresh);
        }
      } catch {
        // network error — keep existing content
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') revalidate();
    }

    function onFocus() {
      revalidate();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    return () => {
      stale = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Auto-dismiss notice
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // Visitor flag
  useEffect(() => {
    if (hasVisitedClient) {
      setHasVisitedBefore(true);
    } else {
      try {
        localStorage.setItem(VISITOR_FLAG, 'true');
      } catch {
        // localStorage not available
      }
    }
  }, [hasVisitedClient]);

  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>, app: PublicAppItem) => {
    e.preventDefault();
    trackClick('app_download', app.name);
    
    // Affiche le message
    setNotice({
      message: "Vous allez être redirigé vers la page de téléchargement...",
      tone: 'success'
    });
    
    // Récupère le lien monétisé s'il existe, sinon fallback URL
    const targetUrl = (app as any).lienMonetise || app.downloadUrl;
    
    // Déclenchement Interstitiel Monetag (Zone 229945)
    // On injecte le script spécifique à l'interstitiel pour qu'il s'exécute à ce moment précis
    const scriptId = 'monetag-interstitial-229945';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://quge5.com/88/tag.min.js";
      script.setAttribute('data-zone', '229945');
      script.setAttribute('data-cfasync', 'false');
      script.async = true;
      document.body.appendChild(script);
    }
    
    // Ouverture du lien de destination après un court délai pour laisser lire le message
    setTimeout(() => {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }, 1200);
  };


  const playlists = content.playlists;
  const xtreamCodes = content.xtreamCodes;
  const macPortals = content.macPortals;
  const appItems = content.appItems;

  // Build recent feed
  const recentFeed = useMemo<FeedItem[]>(
    () =>
      [
        ...playlists.map((item) => ({
          id: item._id,
          title: item.title,
          description: item.description || 'Nouvelle playlist M3U disponible',
          type: 'playlists' as const,
          typeLabel: 'M3U',
          createdAt: item.createdAt,
          rawData: item,
        })),
        ...xtreamCodes.map((item) => ({
          id: item._id,
          title: item.title,
          description: item.description || 'Nouvel accès Xtream ajouté',
          type: 'xtreamCodes' as const,
          typeLabel: 'Xtream',
          createdAt: item.createdAt,
          rawData: item,
        })),
        ...macPortals.map((item) => ({
          id: item._id,
          title: item.title,
          description: item.description || 'Nouveau portail Mac disponible',
          type: 'macPortals' as const,
          typeLabel: 'Mac Portal',
          createdAt: item.createdAt,
          rawData: item,
        })),
        ...appItems.map((item) => ({
          id: item._id,
          title: item.name,
          description: item.description || 'Nouvelle application à télécharger',
          type: 'appItems' as const,
          typeLabel: 'Application',
          createdAt: item.createdAt,
          rawData: item,
        })),
      ].sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
        return rightTime - leftTime;
      }),
    [appItems, macPortals, playlists, xtreamCodes],
  );

  const hasContent =
    playlists.length > 0 ||
    xtreamCodes.length > 0 ||
    macPortals.length > 0 ||
    appItems.length > 0;

  const showPlaylists = activeView === 'all' || activeView === 'playlists';
  const showXtream = activeView === 'all' || activeView === 'xtreamCodes';
  const showMacPortals = activeView === 'all' || activeView === 'macPortals';
  const showApps = activeView === 'all' || activeView === 'appItems';

  return (
    <div className="min-h-screen flex flex-col bg-background dot-grid relative">
      <ElectricFilaments />
      <Navbar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Welcome section */}
        {!hasVisitedBefore && (
          <section className="mb-8 sm:mb-12 animate-fade-in">
            <div className="max-w-2xl">
              <h2 className="mb-3 text-2xl sm:text-3xl md:text-4xl font-bold text-[#E8E8ED]">
                Bienvenue sur Ngori
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[#8B8B9E] leading-relaxed">
                Découvrez les derniers contenus IPTV ajoutés : playlists M3U, accès Xtream,
                portails Mac et applications. Filtrez par catégorie en un clic.
              </p>
            </div>
          </section>
        )}

        {/* Notice */}
        {notice && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium animate-fade-in ${
              notice.tone === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {notice.message}
          </div>
        )}

        {/* Load error */}
        {loadError && (
          <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-400 animate-fade-in">
            {loadError}
          </div>
        )}

        <section id="content-zone" className="space-y-10 sm:space-y-14">
          {/* ─── RECENT FEED ─── */}
          {activeView === 'all' && recentFeed.length > 0 && (
            <section className="animate-fade-in">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#E8E8ED]">
                    Récemment ajouté
                  </h3>
                </div>
                <span className="inline-flex self-start sm:self-auto rounded-md bg-[#5E6AD2]/10 px-2.5 py-1 text-[11px] font-medium text-[#8B93E6]">
                  {recentFeed.length} publication(s)
                </span>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {recentFeed.slice(0, 8).map((item, i) => {
                  const badge = TYPE_BADGE[item.type];
                  const detailHref =
                    item.type === 'playlists'
                      ? `/playlist/${item.id}`
                      : item.type === 'xtreamCodes'
                        ? `/xtream/${item.id}`
                        : item.type === 'macPortals'
                          ? `/mac-portal/${item.id}`
                          : null;

                  return (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={detailHref || '/'}
                      onClick={() => trackClick('recent_feed_card', item.title)}
                      className="group block p-5 linear-card animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms`, '--shine-pos': '-100%' } as React.CSSProperties}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <div className="mb-3 flex items-center justify-between gap-2">
                        {badge && (
                          <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        )}
                        <span className="text-[10px] sm:text-xs text-[#5C5C72] flex-shrink-0">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-medium text-[#E8E8ED] leading-snug group-hover:text-white transition-colors">
                        {item.title}
                      </h4>
                      <p className="mt-1.5 text-xs sm:text-sm text-[#5C5C72] line-clamp-2">
                        {item.description}
                      </p>
                      {item.type === 'xtreamCodes' && item.rawData && (
                        <div className="mt-2 text-[10px] sm:text-xs text-[#5C5C72] font-mono space-y-0.5">
                          <p className="truncate">{(item.rawData as XtreamItem).serverUrl}</p>
                          <p>{(item.rawData as XtreamItem).username}</p>
                        </div>
                      )}
                      {item.type === 'macPortals' && item.rawData && (item.rawData as MacPortalItem).macAddress && (
                        <p className="mt-2 text-[10px] sm:text-xs font-mono text-[#5E6AD2]">
                          MAC: {(item.rawData as MacPortalItem).macAddress}
                        </p>
                      )}
                      {item.type === 'appItems' && item.rawData && (
                        <p className="mt-2 text-xs text-[#5C5C72]">
                          {(item.rawData as PublicAppItem).version || 'v1.0.0'} — {(item.rawData as PublicAppItem).fileSize || 'Taille N/A'}
                        </p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#5E6AD2] group-hover:gap-1.5 transition-all">
                        Voir les détails
                        <IconChevronRight size={12} />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ─── PLAYLISTS M3U ─── */}
          {showPlaylists && playlists.length > 0 && (
            <section className="animate-fade-in">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <span className="text-[11px] sm:text-xs uppercase tracking-[0.15em] text-[#5E6AD2] font-medium">M3U</span>
                  <h3 className="mt-1 text-xl sm:text-2xl md:text-3xl font-bold text-[#E8E8ED]">Playlists M3U</h3>
                </div>
                <span className="text-xs sm:text-sm text-[#5C5C72]">{playlists.length} playlist(s)</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {playlists.map((playlist) => (
                  <Link
                    key={playlist._id}
                    href={`/playlist/${playlist._id}`}
                    onClick={() => trackClick('playlist_card', playlist.title)}
                    className="group block linear-card overflow-hidden"
                  >
                    {playlist.logo && (
                      <div className="h-36 sm:h-44 overflow-hidden bg-[#1A1A24]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={playlist.logo} alt={playlist.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <div className="p-4 sm:p-5">
                      {playlist.category && (
                        <span className="inline-flex rounded-md bg-[#5E6AD2]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#8B93E6] mb-2">
                          {playlist.category}
                        </span>
                      )}
                      <h4 className="text-sm sm:text-base font-medium text-[#E8E8ED] leading-snug group-hover:text-white transition-colors">
                        {playlist.title}
                      </h4>
                      <p className="mt-1.5 text-xs sm:text-sm text-[#5C5C72] line-clamp-2">
                        {playlist.description || 'Playlist disponible au téléchargement'}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs text-[#5C5C72]">{formatDate(playlist.createdAt)}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5E6AD2] group-hover:gap-1.5 transition-all">
                          Voir
                          <IconChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ─── XTREAM CODES ─── */}
          {showXtream && xtreamCodes.length > 0 && (
            <section className="animate-fade-in">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <span className="text-[11px] sm:text-xs uppercase tracking-[0.15em] text-emerald-400 font-medium">Xtream</span>
                  <h3 className="mt-1 text-xl sm:text-2xl md:text-3xl font-bold text-[#E8E8ED]">Accès Xtream</h3>
                </div>
                <span className="text-xs sm:text-sm text-[#5C5C72]">{xtreamCodes.length} accès</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {xtreamCodes.map((code) => (
                  <Link
                    key={code._id}
                    href={`/xtream/${code._id}`}
                    onClick={() => trackClick('xtream_card', code.title)}
                    className="group block p-4 sm:p-5 linear-card"
                  >
                    {(code.category || code.expirationDate) && (
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {code.category && (
                          <span className="inline-flex rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                            {code.category}
                          </span>
                        )}
                        {code.expirationDate && (
                          <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            new Date(code.expirationDate) < new Date()
                              ? 'bg-red-500/15 text-red-400'
                              : 'bg-emerald-500/15 text-emerald-400'
                          }`}>
                            {new Date(code.expirationDate) < new Date() ? 'Expiré' : 'Actif'}
                          </span>
                        )}
                      </div>
                    )}
                    <h4 className="text-sm sm:text-base font-medium text-[#E8E8ED] leading-snug group-hover:text-white transition-colors">
                      {code.title}
                    </h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#5C5C72] line-clamp-2">
                      {code.description || 'Connexion Xtream disponible'}
                    </p>
                    <div className="mt-3 space-y-1 text-xs sm:text-sm">
                      <p className="truncate">
                        <span className="font-medium text-[#8B8B9E]">Serveur:</span> <span className="text-[#5C5C72] break-all">{code.serverUrl}</span>
                      </p>
                      <p>
                        <span className="font-medium text-[#8B8B9E]">Utilisateur:</span> <span className="text-[#5C5C72]">{code.username}</span>
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-[#5C5C72]">{formatDate(code.createdAt)}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5E6AD2] group-hover:gap-1.5 transition-all">
                        Voir
                        <IconChevronRight size={12} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ─── MAC PORTALS ─── */}
          {showMacPortals && macPortals.length > 0 && (
            <section className="animate-fade-in">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <span className="text-[11px] sm:text-xs uppercase tracking-[0.15em] text-amber-400 font-medium">Mac Portal</span>
                  <h3 className="mt-1 text-xl sm:text-2xl md:text-3xl font-bold text-[#E8E8ED]">Portails Mac</h3>
                </div>
                <span className="text-xs sm:text-sm text-[#5C5C72]">{macPortals.length} portail(x)</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {macPortals.map((portal) => (
                  <Link
                    key={portal._id}
                    href={`/mac-portal/${portal._id}`}
                    onClick={() => trackClick('mac_portal_card', portal.title)}
                    className="group block p-4 sm:p-5 linear-card"
                  >
                    {portal.category && (
                      <span className="inline-flex rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-400 mb-2">
                        {portal.category}
                      </span>
                    )}
                    <h4 className="text-sm sm:text-base font-medium text-[#E8E8ED] leading-snug group-hover:text-white transition-colors">
                      {portal.title}
                    </h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#5C5C72] line-clamp-2">
                      {portal.description || 'Portail disponible'}
                    </p>
                    {portal.macAddress && (
                      <p className="mt-2 text-xs sm:text-sm">
                        <span className="text-[#5C5C72]">MAC: </span>
                        <span className="font-mono text-[#5E6AD2] text-[10px] sm:text-xs">{portal.macAddress}</span>
                      </p>
                    )}
                    {portal.macIdentifier && (
                      <p className="mt-1 text-xs sm:text-sm">
                        <span className="text-[#5C5C72]">ID: </span>
                        <span className="font-mono text-[#5E6AD2] text-[10px] sm:text-xs">{portal.macIdentifier}</span>
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-[#5C5C72]">{formatDate(portal.createdAt)}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5E6AD2] group-hover:gap-1.5 transition-all">
                        Voir
                        <IconChevronRight size={12} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ─── APPLICATIONS ─── */}
          {showApps && appItems.length > 0 && (
            <section className="animate-fade-in">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <span className="text-[11px] sm:text-xs uppercase tracking-[0.15em] text-purple-400 font-medium">Applications</span>
                  <h3 className="mt-1 text-xl sm:text-2xl md:text-3xl font-bold text-[#E8E8ED]">Applications</h3>
                </div>
                <span className="text-xs sm:text-sm text-[#5C5C72]">{appItems.length} application(s)</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {appItems.map((app) => (
                  <article
                    key={app._id}
                    className="p-4 sm:p-5 linear-card flex flex-col"
                  >
                    <div className="flex items-center gap-3">
                      {app.icon && (
                         <div className="flex-shrink-0">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={app.icon} alt={app.name} className="w-12 h-12 rounded-lg object-cover" />
                         </div>
                      )}
                      <div>
                        <h4 className="text-sm sm:text-base font-medium text-[#E8E8ED] leading-snug">
                          {app.name}
                        </h4>
                        {app.rating && app.rating !== 'N/A' && (
                          <div className="flex items-center mt-0.5 text-xs text-[#d4a843]">
                            <svg className="w-3.5 h-3.5 fill-current mr-1" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {app.rating}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-[#5C5C72] line-clamp-2">
                      {app.description || 'Application disponible au téléchargement'}
                    </p>
                    <div className="mt-3 text-xs sm:text-sm text-[#5C5C72]">
                      <p>Version: {app.version || '1.0.0'}</p>
                      {app.fileSize && <p>Taille: {app.fileSize}</p>}
                    </div>
                    <button
                      onClick={(e) => handleDownload(e, app)}
                      className="mt-4 block w-full rounded-lg bg-[#5E6AD2] px-4 py-2.5 text-center text-sm font-medium text-white transition-all hover:bg-[#7C6BF7] active:scale-[0.98]"
                    >
                      Télécharger
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ─── EMPTY STATE ─── */}
          {!hasContent && (
            <section className="py-16 sm:py-20 text-center animate-fade-in">
              <div className="mx-auto max-w-md">
                <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <IconDocument size={24} className="text-[#5C5C72]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#E8E8ED] mb-2">Aucun contenu</h3>
                <p className="text-sm sm:text-base text-[#5C5C72]">
                  {loadError
                    ? 'Le contenu est temporairement indisponible.'
                    : "Rien n'est publié pour le moment."}
                </p>
                <p className="text-xs sm:text-sm text-[#5C5C72] mt-1">
                  {loadError ? 'Réessayez dans un instant.' : 'Revenez un peu plus tard.'}
                </p>
              </div>
            </section>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
