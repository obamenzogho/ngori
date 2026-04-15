'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import AdBanner from './ad-banner';
import Footer from './footer';
import { formatDate } from './format-date';
import Navbar, { type ContentView } from './navbar';

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

// ─── Badge color map ───

const TYPE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  playlists: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'M3U' },
  xtreamCodes: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Xtream' },
  macPortals: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Mac Portal' },
  appItems: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Application' },
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
    <div className="min-h-screen flex flex-col bg-[#F5F7FF]">
      <Navbar activeView={activeView} onViewChange={setActiveView} />

      {/* Header Ad Banner */}
      <AdBanner variant="header" />

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Welcome section */}
        {!hasVisitedBefore && (
          <section className="mb-8 sm:mb-12 animate-fade-in">
            <div className="max-w-2xl">
              <h2 className="mb-3 text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a2e]">
                Bienvenue sur Ngori
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
                Découvrez les derniers contenus IPTV ajoutés : playlists M3U, accès Xtream,
                portails Mac et applications. Filtrez par catégorie en un clic.
              </p>
            </div>
          </section>
        )}

        {/* Notice */}
        {notice && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium animate-fade-in ${
              notice.tone === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {notice.message}
          </div>
        )}

        {/* Load error */}
        {loadError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 animate-fade-in">
            {loadError}
          </div>
        )}

        <section id="content-zone" className="space-y-10 sm:space-y-14">
          {/* ─── RECENT FEED ─── */}
          {activeView === 'all' && recentFeed.length > 0 && (
            <section className="animate-fade-in">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1a1a2e]">
                    Récemment ajouté
                  </h3>
                </div>
                <span className="inline-flex self-start sm:self-auto rounded-full bg-[#4169E1]/10 px-3 py-1 text-xs font-semibold text-[#4169E1]">
                  {recentFeed.length} publication(s)
                </span>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {recentFeed.slice(0, 8).map((item) => {
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
                      className="group block rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#4169E1]/30 hover:-translate-y-0.5"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        {badge && (
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        )}
                        <span className="text-[10px] sm:text-xs text-slate-400 flex-shrink-0">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-[#1a1a2e] leading-snug group-hover:text-[#4169E1] transition-colors">
                        {item.title}
                      </h4>
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 line-clamp-2">
                        {item.description}
                      </p>
                      {item.type === 'xtreamCodes' && item.rawData && (
                        <div className="mt-2 text-[10px] sm:text-xs text-slate-400 font-mono space-y-0.5">
                          <p className="truncate">{(item.rawData as XtreamItem).serverUrl}</p>
                          <p>{(item.rawData as XtreamItem).username}</p>
                        </div>
                      )}
                      {item.type === 'macPortals' && item.rawData && (item.rawData as MacPortalItem).macAddress && (
                        <p className="mt-2 text-[10px] sm:text-xs font-mono text-[#4169E1]">
                          MAC: {(item.rawData as MacPortalItem).macAddress}
                        </p>
                      )}
                      {item.type === 'appItems' && item.rawData && (
                        <p className="mt-2 text-xs text-slate-400">
                          {(item.rawData as PublicAppItem).version || 'v1.0.0'} — {(item.rawData as PublicAppItem).fileSize || 'Taille N/A'}
                        </p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4169E1] group-hover:gap-2.5 transition-all">
                        Voir les détails
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
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
                  <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">M3U</span>
                  <h3 className="mt-1 text-xl sm:text-2xl md:text-3xl font-bold text-[#1a1a2e]">Playlists M3U</h3>
                </div>
                <span className="text-xs sm:text-sm text-slate-500">{playlists.length} playlist(s)</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {playlists.map((playlist) => (
                  <Link
                    key={playlist._id}
                    href={`/playlist/${playlist._id}`}
                    className="group block rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-300/50 hover:-translate-y-0.5"
                  >
                    {playlist.logo && (
                      <div className="h-40 sm:h-48 rounded-t-2xl overflow-hidden bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={playlist.logo} alt={playlist.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5">
                      {playlist.category && (
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700 mb-2">
                          {playlist.category}
                        </span>
                      )}
                      <h4 className="text-base sm:text-lg font-semibold text-[#1a1a2e] leading-snug group-hover:text-[#4169E1] transition-colors">
                        {playlist.title}
                      </h4>
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 line-clamp-2">
                        {playlist.description || 'Playlist disponible au téléchargement'}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs text-slate-400">{formatDate(playlist.createdAt)}</span>
                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#4169E1] group-hover:gap-1.5 transition-all">
                          Voir
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
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
                  <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-emerald-600 font-semibold">Xtream</span>
                  <h3 className="mt-1 text-xl sm:text-2xl md:text-3xl font-bold text-[#1a1a2e]">Accès Xtream</h3>
                </div>
                <span className="text-xs sm:text-sm text-slate-500">{xtreamCodes.length} accès</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {xtreamCodes.map((code) => (
                  <Link
                    key={code._id}
                    href={`/xtream/${code._id}`}
                    className="group block rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-300/50 hover:-translate-y-0.5"
                  >
                    {(code.category || code.expirationDate) && (
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {code.category && (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                            {code.category}
                          </span>
                        )}
                        {code.expirationDate && (
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            new Date(code.expirationDate) < new Date()
                              ? 'bg-red-50 text-red-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {new Date(code.expirationDate) < new Date() ? 'Expiré' : 'Actif'}
                          </span>
                        )}
                      </div>
                    )}
                    <h4 className="text-base sm:text-lg font-semibold text-[#1a1a2e] leading-snug group-hover:text-[#4169E1] transition-colors">
                      {code.title}
                    </h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 line-clamp-2">
                      {code.description || 'Connexion Xtream disponible'}
                    </p>
                    <div className="mt-3 space-y-1 text-xs sm:text-sm">
                      <p className="truncate">
                        <span className="font-medium text-slate-700">Serveur:</span> <span className="text-slate-400 break-all">{code.serverUrl}</span>
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">Utilisateur:</span> <span className="text-slate-500">{code.username}</span>
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-slate-400">{formatDate(code.createdAt)}</span>
                      <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#4169E1] group-hover:gap-1.5 transition-all">
                        Voir
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ─── AD ─── */}
          <AdBanner variant="fluid" />

          {/* ─── MAC PORTALS ─── */}
          {showMacPortals && macPortals.length > 0 && (
            <section className="animate-fade-in">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-orange-600 font-semibold">Mac Portal</span>
                  <h3 className="mt-1 text-xl sm:text-2xl md:text-3xl font-bold text-[#1a1a2e]">Portails Mac</h3>
                </div>
                <span className="text-xs sm:text-sm text-slate-500">{macPortals.length} portail(x)</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {macPortals.map((portal) => (
                  <Link
                    key={portal._id}
                    href={`/mac-portal/${portal._id}`}
                    className="group block rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-orange-300/50 hover:-translate-y-0.5"
                  >
                    {portal.category && (
                      <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-700 mb-2">
                        {portal.category}
                      </span>
                    )}
                    <h4 className="text-base sm:text-lg font-semibold text-[#1a1a2e] leading-snug group-hover:text-[#4169E1] transition-colors">
                      {portal.title}
                    </h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 line-clamp-2">
                      {portal.description || 'Portail disponible'}
                    </p>
                    {portal.macAddress && (
                      <p className="mt-2 text-xs sm:text-sm">
                        <span className="text-slate-400">MAC: </span>
                        <span className="font-mono text-[#4169E1] text-[10px] sm:text-xs">{portal.macAddress}</span>
                      </p>
                    )}
                    {portal.macIdentifier && (
                      <p className="mt-1 text-xs sm:text-sm">
                        <span className="text-slate-400">ID: </span>
                        <span className="font-mono text-[#4169E1] text-[10px] sm:text-xs">{portal.macIdentifier}</span>
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-slate-400">{formatDate(portal.createdAt)}</span>
                      <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#4169E1] group-hover:gap-1.5 transition-all">
                        Voir
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
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
                  <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-purple-600 font-semibold">Applications</span>
                  <h3 className="mt-1 text-xl sm:text-2xl md:text-3xl font-bold text-[#1a1a2e]">Applications</h3>
                </div>
                <span className="text-xs sm:text-sm text-slate-500">{appItems.length} application(s)</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {appItems.map((app) => (
                  <article
                    key={app._id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-purple-300/50 hover:-translate-y-0.5"
                  >
                    <h4 className="text-base sm:text-lg font-semibold text-[#1a1a2e] leading-snug">
                      {app.name}
                    </h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 line-clamp-2">
                      {app.description || 'Application disponible au téléchargement'}
                    </p>
                    <div className="mt-3 text-xs sm:text-sm text-slate-400">
                      <p>Version: {app.version || '1.0.0'}</p>
                      {app.fileSize && <p>Taille: {app.fileSize}</p>}
                    </div>
                    <a
                      href={app.downloadUrl}
                      className="mt-4 block w-full rounded-xl bg-[#4169E1] px-4 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-[#3457c7] active:scale-[0.98] shadow-sm shadow-[#4169E1]/20"
                    >
                      Télécharger
                    </a>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ─── EMPTY STATE ─── */}
          {!hasContent && (
            <section className="py-16 sm:py-20 text-center animate-fade-in">
              <div className="mx-auto max-w-md">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-2">Aucun contenu</h3>
                <p className="text-sm sm:text-base text-slate-500">
                  {loadError
                    ? 'Le contenu est temporairement indisponible.'
                    : "Rien n'est publié pour le moment."}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
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
