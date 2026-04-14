'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

const VISITOR_FLAG = 'ngori_visited';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    _atws?: { _a_: { placementId: number; target: string; id: string }[] };
    atOptions?: {
      key: string;
      format: string;
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
  }
}

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

export type ContentView = 'all' | 'playlists' | 'xtreamCodes' | 'macPortals' | 'appItems';

type BaseContentItem = {
  _id: string;
  createdAt?: string;
  description?: string;
};

export type PlaylistItem = BaseContentItem & {
  content: string;
  title: string;
};

export type XtreamItem = BaseContentItem & {
  password: string;
  serverUrl: string;
  title: string;
  username: string;
};

export type MacPortalItem = BaseContentItem & {
  macAddress?: string;
  macIdentifier?: string;
  portalUrl: string;
  title: string;
};

export type PublicAppItem = BaseContentItem & {
  downloadUrl: string;
  fileSize?: string;
  name: string;
  version?: string;
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

const NAV_ITEMS: Array<{ id: ContentView; label: string; icon: string }> = [
  { id: 'all', label: 'Actualites', icon: '📰' },
  { id: 'playlists', label: 'M3U', icon: '🎵' },
  { id: 'xtreamCodes', label: 'Xtream', icon: '📡' },
  { id: 'macPortals', label: 'Mac Portal', icon: '🖥️' },
  { id: 'appItems', label: 'Applications', icon: '📱' },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDate(value?: string) {
  if (!value) {
    return 'Date inconnue';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date inconnue';
  }

  const months = [
    'janv.',
    'fevr.',
    'mars',
    'avr.',
    'mai',
    'juin',
    'juil.',
    'aout',
    'sept.',
    'oct.',
    'nov.',
    'dec.',
  ];

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${day} ${month} ${year} a ${hours}:${minutes} UTC`;
}

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasVisitedClient = useHasVisited();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [notice]);

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

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper: push AdSense ads with retry for mobile browsers
  const pushAdSenseAds = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const ads = document.querySelectorAll('.adsbygoogle');
      ads.forEach(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
          // individual push failure — ignore
        }
      });
    } catch {
      // AdSense not available
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Push AdSense for each <ins> element (with retry for slow mobile connections)
    pushAdSenseAds();
    const retryTimer = setTimeout(pushAdSenseAds, 2000);
    const retryTimer2 = setTimeout(pushAdSenseAds, 5000);

    // Configure atOptions for banner (responsive - adapts to screen size)
    const updateAtOptions = () => {
      const isWideScreen = window.innerWidth >= 728;
      window.atOptions = {
        key: '3c1573cf88699be69e51c3767ebdd818',
        format: 'iframe',
        height: isWideScreen ? 90 : 50,
        width: isWideScreen ? 728 : 320,
        params: {},
      };
    };
    updateAtOptions();

    // Load banner script only after the container exists in the DOM
    const bannerContainer = document.getElementById('banner-728x90');
    if (bannerContainer) {
      const bannerScript = document.createElement('script');
      bannerScript.src = 'https://www.highperformanceformat.com/3c1573cf88699be69e51c3767ebdd818/invoke.js';
      bannerScript.async = true;
      bannerContainer.appendChild(bannerScript);
    }

    // Load native banner script only after its container exists
    const nativeContainer = document.getElementById('container-3b8b394af5e5faeda0898b04416b8c81');
    if (nativeContainer) {
      const nativeScript = document.createElement('script');
      nativeScript.async = true;
      nativeScript.setAttribute('data-cfasync', 'false');
      nativeScript.src = 'https://pl29139985.profitablecpmratenetwork.com/3b8b394af5e5faeda0898b04416b8c81/invoke.js';
      nativeContainer.appendChild(nativeScript);
    }

    // Configure Adsterra placements
    if (typeof window._atws !== 'object') {
      window._atws = { _a_: [] };
    }
    window._atws._a_.push({
      placementId: 3248886,
      target: '_blank',
      id: 'adsterra-home-footer-banner',
    });

    return () => {
      clearTimeout(retryTimer);
      clearTimeout(retryTimer2);
    };
  }, [pushAdSenseAds]);

  const playlists = initialContent.playlists;
  const xtreamCodes = initialContent.xtreamCodes;
  const macPortals = initialContent.macPortals;
  const appItems = initialContent.appItems;

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
          description: item.description || 'Nouvel acces Xtream ajoute',
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
          description: item.description || 'Nouvelle application a telecharger',
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
    [appItems, macPortals, playlists, xtreamCodes]
  );

  const hasContent =
    playlists.length > 0 ||
    xtreamCodes.length > 0 ||
    macPortals.length > 0 ||
    appItems.length > 0;

  const goToView = useCallback((view: ContentView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById('content-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  const showNotice = (message: string, tone: Notice['tone']) => {
    setNotice({ message, tone });
  };

  const downloadPlaylist = (playlist: PlaylistItem) => {
    try {
      const fileName = `${slugify(playlist.title || 'playlist') || 'playlist'}.m3u`;
      const blob = new Blob([playlist.content], { type: 'audio/x-mpegurl;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showNotice('Le telechargement de la playlist a commence.', 'success');
    } catch (error) {
      console.error('Erreur de telechargement:', error);
      showNotice('Impossible de telecharger cette playlist.', 'error');
    }
  };

  const copyXtreamDetails = async (item: XtreamItem) => {
    const details = [
      `Titre: ${item.title}`,
      `Serveur: ${item.serverUrl}`,
      `Utilisateur: ${item.username}`,
      `Mot de passe: ${item.password}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(details);
      showNotice('Les informations Xtream ont ete copiees.', 'success');
    } catch (error) {
      console.error('Erreur de copie:', error);
      showNotice('Impossible de copier les informations Xtream.', 'error');
    }
  };

  const showPlaylists = activeView === 'all' || activeView === 'playlists';
  const showXtream = activeView === 'all' || activeView === 'xtreamCodes';
  const showMacPortals = activeView === 'all' || activeView === 'macPortals';
  const showApps = activeView === 'all' || activeView === 'appItems';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ─── HEADER / NAV ─── */}
      <header className="sticky top-0 z-50 border-b border-slate-700/80 bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-xl sm:text-2xl lg:text-3xl font-bold text-transparent select-none">
                Ngori
              </h1>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goToView(item.id)}
                  className={`whitespace-nowrap rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold transition-all duration-200 ${
                    activeView === item.id
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative z-50 p-2 -mr-2 text-slate-200 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div
          ref={menuRef}
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="px-4 pb-4 pt-2 space-y-1 border-t border-slate-700/50 bg-slate-900/98 backdrop-blur-md">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => goToView(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-800/60 text-slate-200 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ─── AD BANNER (responsive) ─── */}
      <div className="w-full py-2 sm:py-3 md:py-4 flex justify-center border-b border-slate-800/50 bg-slate-900/30">
        <div className="w-full max-w-[728px] mx-auto px-2 sm:px-4">
          <div id="banner-728x90" className="min-h-[50px] sm:min-h-[90px]"></div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <main className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Welcome section */}
        {!hasVisitedBefore && (
          <section className="mb-6 sm:mb-8 md:mb-12">
            <div className="max-w-2xl">
              <h2 className="mb-2 sm:mb-3 md:mb-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                Bienvenue sur Ngori
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">
                Decouvrez les derniers contenus IPTV ajoutes : playlists M3U, acces Xtream,
                portails Mac et applications. Filtrez par categorie en un clic.
              </p>
            </div>
          </section>
        )}

        {/* Notice */}
        {notice && (
          <div
            className={`mb-4 sm:mb-6 rounded-lg border px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm ${
              notice.tone === 'success'
                ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100'
                : 'border-red-500/60 bg-red-500/10 text-red-100'
            }`}
          >
            {notice.message}
          </div>
        )}

        {/* Load error */}
        {loadError && (
          <div className="mb-4 sm:mb-6 rounded-lg border border-amber-500/60 bg-amber-500/10 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-amber-100">
            {loadError}
          </div>
        )}

        <section id="content-zone" className="space-y-8 sm:space-y-10 md:space-y-16">
          {/* ─── RECENT FEED ─── */}
          {activeView === 'all' && recentFeed.length > 0 && (
            <section>
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl md:text-3xl font-bold">Recemment ajoute</h3>
                </div>
                <p className="rounded-full bg-slate-800 px-3 py-1 text-xs sm:text-sm text-slate-300 self-start sm:self-auto">
                  {recentFeed.length} publication(s)
                </p>
              </div>

              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {recentFeed.slice(0, 8).map((item) => (
                  <article
                    key={`${item.type}-${item.id}`}
                    className="rounded-xl border border-slate-700 bg-slate-800/50 p-3.5 sm:p-4 md:p-5 backdrop-blur transition hover:border-cyan-500/70 hover:shadow-lg hover:shadow-cyan-500/5"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-cyan-200">
                        {item.typeLabel}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-400 flex-shrink-0">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg md:text-xl font-semibold text-white leading-snug">{item.title}</h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-300 line-clamp-2">{item.description}</p>
                    {item.type === 'playlists' && item.rawData && (
                      <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                        {(item.rawData as PlaylistItem).content?.slice(0, 120)}...
                      </p>
                    )}
                    {item.type === 'xtreamCodes' && item.rawData && (
                      <div className="mt-2 text-[10px] sm:text-xs text-slate-500 font-mono space-y-0.5">
                        <p className="truncate">{(item.rawData as XtreamItem).serverUrl}</p>
                        <p>{(item.rawData as XtreamItem).username}</p>
                      </div>
                    )}
                    {item.type === 'macPortals' && item.rawData && (item.rawData as MacPortalItem).macAddress && (
                      <p className="mt-2 text-[10px] sm:text-xs font-mono text-cyan-400">
                        MAC: {(item.rawData as MacPortalItem).macAddress}
                      </p>
                    )}
                    {item.type === 'appItems' && item.rawData && (
                      <p className="mt-2 text-xs text-slate-400">
                        {(item.rawData as PublicAppItem).version || 'v1.0.0'} - {(item.rawData as PublicAppItem).fileSize || 'Taille N/A'}
                      </p>
                    )}
                    <button
                      onClick={() => goToView(item.type)}
                      className="mt-3 sm:mt-4 rounded-lg bg-slate-900/80 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-cyan-200 transition hover:bg-slate-700 active:scale-95"
                    >
                      Voir cette categorie
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ─── PLAYLISTS M3U ─── */}
          {showPlaylists && playlists.length > 0 && (
            <section>
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
                <div>
                  <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] text-blue-300">M3U</p>
                  <h3 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold">Playlists M3U</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">{playlists.length} playlist(s)</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {playlists.map((playlist) => (
                  <article
                    key={playlist._id}
                    className="rounded-xl border border-slate-700 bg-slate-800/50 p-3.5 sm:p-4 md:p-6 backdrop-blur transition hover:border-blue-500/70 hover:shadow-lg hover:shadow-blue-500/5"
                  >
                    <div className="mb-2 sm:mb-3 flex items-start justify-between gap-2">
                      <h4 className="text-base sm:text-lg md:text-xl font-semibold leading-snug">{playlist.title}</h4>
                      <span className="text-[10px] sm:text-xs text-slate-400 flex-shrink-0 mt-1">
                        {formatDate(playlist.createdAt)}
                      </span>
                    </div>
                    <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-slate-300 line-clamp-2">
                      {playlist.description || 'Playlist disponible au telechargement'}
                    </p>
                    <button
                      onClick={() => downloadPlaylist(playlist)}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-700 active:scale-[0.98]"
                    >
                      Telecharger la playlist
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ─── XTREAM CODES ─── */}
          {showXtream && xtreamCodes.length > 0 && (
            <section>
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
                <div>
                  <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] text-emerald-300">Xtream</p>
                  <h3 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold">Acces Xtream</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">{xtreamCodes.length} acces</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {xtreamCodes.map((code) => (
                  <article
                    key={code._id}
                    className="rounded-xl border border-slate-700 bg-slate-800/50 p-3.5 sm:p-4 md:p-6 backdrop-blur transition hover:border-green-500/70 hover:shadow-lg hover:shadow-green-500/5"
                  >
                    <div className="mb-2 sm:mb-3 flex items-start justify-between gap-2">
                      <h4 className="text-base sm:text-lg md:text-xl font-semibold leading-snug">{code.title}</h4>
                      <span className="text-[10px] sm:text-xs text-slate-400 flex-shrink-0 mt-1">
                        {formatDate(code.createdAt)}
                      </span>
                    </div>
                    <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-slate-300 line-clamp-2">
                      {code.description || 'Connexion Xtream disponible'}
                    </p>
                    <div className="mb-3 sm:mb-4 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <p className="truncate">
                        <span className="font-semibold">Serveur:</span> <span className="text-slate-400 break-all">{code.serverUrl}</span>
                      </p>
                      <p>
                        <span className="font-semibold">Utilisateur:</span> {code.username}
                      </p>
                    </div>
                    <button
                      onClick={() => void copyXtreamDetails(code)}
                      className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium transition hover:bg-green-700 active:scale-[0.98]"
                    >
                      Copier les informations
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ─── AD - Fluid ─── */}
          <div className="my-6 sm:my-8 py-3 sm:py-4 border-y border-slate-700/50">
            <div className="mx-auto max-w-4xl px-2 sm:px-4">
              <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', minHeight: '50px' }}
                data-ad-client="ca-pub-6216012186493058"
                data-ad-slot="1234567892"
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
            </div>
          </div>

          {/* ─── MAC PORTALS ─── */}
          {showMacPortals && macPortals.length > 0 && (
            <section>
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
                <div>
                  <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] text-orange-300">Mac Portal</p>
                  <h3 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold">Portails Mac</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">{macPortals.length} portail(x)</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {macPortals.map((portal) => (
                  <article
                    key={portal._id}
                    className="rounded-xl border border-slate-700 bg-slate-800/50 p-3.5 sm:p-4 md:p-6 backdrop-blur transition hover:border-orange-500/70 hover:shadow-lg hover:shadow-orange-500/5"
                  >
                    <div className="mb-2 sm:mb-3 flex items-start justify-between gap-2">
                      <h4 className="text-base sm:text-lg md:text-xl font-semibold leading-snug">{portal.title}</h4>
                      <span className="text-[10px] sm:text-xs text-slate-400 flex-shrink-0 mt-1">
                        {formatDate(portal.createdAt)}
                      </span>
                    </div>
                    <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-slate-300 line-clamp-2">
                      {portal.description || 'Portail disponible'}
                    </p>
                    {portal.macAddress && (
                      <p className="mb-1 sm:mb-2 text-xs sm:text-sm">
                        <span className="text-slate-400">MAC: </span>
                        <span className="font-mono text-cyan-300 text-[10px] sm:text-xs">{portal.macAddress}</span>
                      </p>
                    )}
                    {portal.macIdentifier && (
                      <p className="mb-2 sm:mb-3 text-xs sm:text-sm">
                        <span className="text-slate-400">ID: </span>
                        <span className="font-mono text-cyan-300 text-[10px] sm:text-xs">{portal.macIdentifier}</span>
                      </p>
                    )}
                    <div className="flex gap-2">
                      {portal.macAddress && (
                        <button
                          onClick={() => {
                            void navigator.clipboard.writeText(portal.macAddress || '');
                            showNotice('Adresse MAC copiee!', 'success');
                          }}
                          className="flex-1 rounded-lg bg-slate-900/80 px-3 py-2 text-xs sm:text-sm text-slate-300 transition hover:bg-slate-700 active:scale-[0.98]"
                        >
                          Copier MAC
                        </button>
                      )}
                      <a
                        href={portal.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-lg bg-orange-600 px-3 py-2 text-center text-xs sm:text-sm font-medium text-white transition hover:bg-orange-700 active:scale-[0.98]"
                      >
                        Ouvrir
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ─── AD - Fluid ─── */}
          <div className="my-6 sm:my-8 py-3 sm:py-4 border-y border-slate-700/50">
            <div className="mx-auto max-w-4xl px-2 sm:px-4">
              <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', minHeight: '50px' }}
                data-ad-client="ca-pub-6216012186493058"
                data-ad-slot="1234567893"
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
            </div>
          </div>

          {/* ─── APPLICATIONS ─── */}
          {showApps && appItems.length > 0 && (
            <section>
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
                <div>
                  <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] text-cyan-300">Applications</p>
                  <h3 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold">Applications</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">{appItems.length} application(s)</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {appItems.map((app) => (
                  <article
                    key={app._id}
                    className="rounded-xl border border-slate-700 bg-slate-800/50 p-3.5 sm:p-4 md:p-6 backdrop-blur transition hover:border-cyan-500/70 hover:shadow-lg hover:shadow-cyan-500/5"
                  >
                    <div className="mb-2 sm:mb-3 flex items-start justify-between gap-2">
                      <h4 className="text-base sm:text-lg md:text-xl font-semibold leading-snug">{app.name}</h4>
                      <span className="text-[10px] sm:text-xs text-slate-400 flex-shrink-0 mt-1">
                        {formatDate(app.createdAt)}
                      </span>
                    </div>
                    <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-slate-300 line-clamp-2">
                      {app.description || 'Application disponible au telechargement'}
                    </p>
                    <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-slate-400">
                      <p>Version: {app.version || '1.0.0'}</p>
                      {app.fileSize && <p>Taille: {app.fileSize}</p>}
                    </div>
                    <a
                      href={app.downloadUrl}
                      className="block w-full rounded-lg bg-cyan-600 px-4 py-2 text-center text-sm font-medium transition hover:bg-cyan-700 active:scale-[0.98]"
                    >
                      Telecharger
                    </a>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ─── EMPTY STATE ─── */}
          {!hasContent && (
            <section className="py-10 sm:py-12 md:py-16 text-center">
              <p className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-5xl">Aucun contenu</p>
              <p className="text-base sm:text-lg md:text-xl text-slate-300">
                {loadError
                  ? 'Le contenu est temporairement indisponible.'
                  : "Rien n'est publie pour le moment."}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                {loadError ? 'Reessayez dans un instant.' : 'Revenez un peu plus tard.'}
              </p>
            </section>
          )}
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="mt-8 sm:mt-10 md:mt-16 border-t border-slate-700 bg-slate-900/95">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8 rounded-lg border border-slate-700 bg-slate-800/50 p-3 sm:p-4 text-center overflow-hidden">
            <div id="adsterra-home-footer-banner"></div>
          </div>
          <div className="mb-6 sm:mb-8 rounded-lg border border-slate-700 bg-slate-800/50 p-3 sm:p-4 text-center overflow-hidden">
            <div id="container-3b8b394af5e5faeda0898b04416b8c81"></div>
          </div>
          <div className="text-center text-xs sm:text-sm text-slate-400">
            <p>&copy; 2026 Ngori - Partager et decouvrir du contenu</p>
            <p className="mt-1">Propulse par la plateforme Ngori</p>
          </div>
        </div>
      </footer>
    </div>
  );
}