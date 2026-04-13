'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

const VISITOR_FLAG = 'ngori_visited';

declare global {
  interface Window {
    _atws?: { _a_: { placementId: number; target: string; id: string }[] };
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

const NAV_ITEMS: Array<{ id: ContentView; label: string }> = [
  { id: 'all', label: 'Actualites' },
  { id: 'playlists', label: 'M3U' },
  { id: 'xtreamCodes', label: 'Xtream' },
  { id: 'macPortals', label: 'Mac Portal' },
  { id: 'appItems', label: 'Applications' },
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
  const hasVisitedClient = useHasVisited();

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load banner 728x90
    const bannerScript = document.createElement('script');
    bannerScript.src = 'https://www.highperformanceformat.com/3c1573cf88699be69e51c3767ebdd818/invoke.js';
    document.body.appendChild(bannerScript);

    // Inject atOptions globally
    (window as Window & { atOptions?: object }).atOptions = {
      'key': '3c1573cf88699be69e51c3767ebdd818',
      'format': 'iframe',
      'height': 90,
      'width': 728,
      'params': {}
    };

    // Load Adsterra native banner script
    const nativeScript = document.createElement('script');
    nativeScript.async = true;
    nativeScript.setAttribute('data-cfasync', 'false');
    nativeScript.src = 'https://pl29139985.profitablecpmratenetwork.com/3b8b394af5e5faeda0898b04416b8c81/invoke.js';
    document.body.appendChild(nativeScript);

    // Load Adsterra core and footer banner
    if (typeof (window as Window & { _atws?: unknown })._atws !== 'object') {
      (window as Window & { _atws?: { _a_ : { placementId: number; target: string; id: string }[] } })._atws = { _a_: [] };
    }

    const coreScript = document.createElement('script');
    coreScript.async = true;
    coreScript.src = 'https://cdn.adsterra.com/core.min.js';
    coreScript.setAttribute('data-api-key', process.env.NEXT_PUBLIC_ADSTERRA_API_KEY || '');
    coreScript.crossOrigin = 'anonymous';
    
    coreScript.onload = () => {
      if (typeof (window as Window & { _atws?: unknown })._atws === 'object' && (window as Window & { _atws?: { _a_: { placementId: number; target: string; id: string }[] } })._atws?._a_) {
        (window as Window & { _atws?: { _a_: { placementId: number; target: string; id: string }[] } })._atws!._a_.push({ 
          placementId: 3248886, 
          target: "_blank",
          id: "adsterra-home-footer-banner"
        });
      }
    };

    document.body.appendChild(coreScript);

    return () => {
      if (bannerScript.parentNode) bannerScript.parentNode.removeChild(bannerScript);
      if (nativeScript.parentNode) nativeScript.parentNode.removeChild(nativeScript);
      if (coreScript.parentNode) coreScript.parentNode.removeChild(coreScript);
    };
  }, []);

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

  const goToView = (view: ContentView) => {
    setActiveView(view);
    document.getElementById('content-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-4">
              <h1 className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-2xl md:text-3xl font-bold text-transparent">
                Ngori
              </h1>
            </div>

            <nav className="flex flex-wrap gap-1.5 md:gap-2 max-w-full overflow-x-auto pb-2 sm:pb-0">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goToView(item.id)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold transition ${
                    activeView === item.id
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div className="w-full py-3 md:py-4 flex justify-center overflow-x-auto border-b border-slate-800 bg-slate-900/50">
        <div className="min-w-[320px] sm:min-w-auto max-w-[728px] mx-auto">
          <div id="banner-728x90"></div>
        </div>
      </div>

      <main className="container mx-auto px-3 md:px-4 py-8 md:py-12">
        {!hasVisitedBefore && (
          <section className="mb-8 md:mb-12 grid gap-6 md:gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div>
              <h2 className="mb-3 md:mb-4 text-2xl md:text-3xl lg:text-4xl font-bold md:text-5xl">
                Bienvenue sur Ngori
              </h2>
              <p className="max-w-2xl text-base md:text-lg text-slate-300">
                Decouvrez les derniers contenus IPTV ajoutes : playlists M3U, acces Xtream,
                portails Mac et applications. Filtrez par categorie en un clic.
              </p>
            </div>

            
          </section>
        )}

        {notice && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              notice.tone === 'success'
                ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100'
                : 'border-red-500/60 bg-red-500/10 text-red-100'
            }`}
          >
            {notice.message}
          </div>
        )}

        {loadError && (
          <div className="mb-6 rounded-lg border border-amber-500/60 bg-amber-500/10 px-4 py-3 text-amber-100">
            {loadError}
          </div>
        )}

        <section id="content-zone" className="space-y-10 md:space-y-16">
          {activeView === 'all' && recentFeed.length > 0 && (
            <section>
              <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <h3 className="mt-2 text-xl md:text-3xl font-bold">Recemment ajoute</h3>
                </div>
                <p className="rounded-full bg-slate-800 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-slate-300 self-start sm:self-auto">
                  {recentFeed.length} publication(s)
                </p>
              </div>

              <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
                {recentFeed.slice(0, 8).map((item) => (
                  <article
                    key={`${item.type}-${item.id}`}
                    className="rounded-xl md:rounded-2xl border border-slate-700 bg-slate-800/50 p-4 md:p-5 backdrop-blur transition hover:border-cyan-500"
                  >
                    <div className="mb-2 md:mb-3 flex items-center justify-between gap-2 md:gap-3">
                      <span className="rounded-full bg-cyan-500/15 px-2 md:px-3 py-0.5 md:py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                        {item.typeLabel}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <h4 className="text-lg md:text-xl font-semibold text-white">{item.title}</h4>
                    <p className="mt-1 md:mt-2 text-sm text-slate-300">{item.description}</p>
                    {item.type === 'playlists' && item.rawData && (
                      <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                        {(item.rawData as PlaylistItem).content?.slice(0, 150)}...
                      </p>
                    )}
                    {item.type === 'xtreamCodes' && item.rawData && (
                      <div className="mt-2 text-xs text-slate-500 font-mono">
                        <p>{(item.rawData as XtreamItem).serverUrl}</p>
                        <p>{(item.rawData as XtreamItem).username}</p>
                      </div>
                    )}
                    {item.type === 'macPortals' && item.rawData && (item.rawData as MacPortalItem).macAddress && (
                      <p className="mt-2 text-xs font-mono text-cyan-400">
                        MAC: {(item.rawData as MacPortalItem).macAddress}
                      </p>
                    )}
                    {item.type === 'appItems' && item.rawData && (
                      <p className="mt-2 text-sm text-slate-400">
                        {(item.rawData as PublicAppItem).version || 'v1.0.0'} - {(item.rawData as PublicAppItem).fileSize || 'Taille N/A'}
                      </p>
                    )}
                    <button
                      onClick={() => goToView(item.type)}
                      className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-slate-700"
                    >
                      Voir cette categorie
                    </button>
                  </article>
                ))}
</div>
            </section>
          )}

          {showPlaylists && playlists.length > 0 && (
            <section>
              <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-blue-300">M3U</p>
                  <h3 className="mt-1 md:mt-2 text-xl md:text-2xl font-bold">Playlists M3U</h3>
                </div>
                <p className="text-sm text-slate-400">{playlists.length} playlist(s)</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {playlists.map((playlist) => (
                  <article
                    key={playlist._id}
                    className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 md:p-6 backdrop-blur transition hover:border-blue-500"
                  >
                    <div className="mb-2 md:mb-3 flex items-center justify-between gap-2 md:gap-3">
                      <h4 className="text-lg md:text-xl font-semibold">{playlist.title}</h4>
                      <span className="text-xs text-slate-400">
                        {formatDate(playlist.createdAt)}
                      </span>
                    </div>
                    <p className="mb-3 md:mb-4 text-slate-300">
                      {playlist.description || 'Playlist disponible au telechargement'}
                    </p>
                    <button
                      onClick={() => downloadPlaylist(playlist)}
                      className="w-full rounded bg-blue-600 px-4 py-2 transition hover:bg-blue-700"
                    >
                      Telecharger la playlist
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {showXtream && xtreamCodes.length > 0 && (
            <section>
              <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">
                    Xtream
                  </p>
                  <h3 className="mt-1 md:mt-2 text-xl md:text-2xl font-bold">Acces Xtream</h3>
                </div>
                <p className="text-sm text-slate-400">{xtreamCodes.length} acces</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {xtreamCodes.map((code) => (
                  <article
                    key={code._id}
                    className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 md:p-6 backdrop-blur transition hover:border-green-500"
                  >
                    <div className="mb-2 md:mb-3 flex items-center justify-between gap-2 md:gap-3">
                      <h4 className="text-lg md:text-xl font-semibold">{code.title}</h4>
                      <span className="text-xs text-slate-400">
                        {formatDate(code.createdAt)}
                      </span>
                    </div>
                    <p className="mb-3 md:mb-4 text-slate-300">
                      {code.description || 'Connexion Xtream disponible'}
                    </p>
                    <div className="mb-3 md:mb-4 space-y-1 md:space-y-2 text-sm">
                      <p className="truncate">
                        <span className="font-semibold">Serveur:</span> <span className="text-slate-400 break-all">{code.serverUrl}</span>
                      </p>
                      <p>
                        <span className="font-semibold">Utilisateur:</span> {code.username}
                      </p>
                    </div>
                    <button
                      onClick={() => void copyXtreamDetails(code)}
                      className="w-full rounded bg-green-600 px-4 py-2 transition hover:bg-green-700"
                    >
                      Copier les informations
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className="my-8 text-center">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', minHeight: '120px' }}
              data-ad-client="ca-pub-6216012186493058"
              data-ad-slot="1234567892"
              data-ad-format="fluid"
              data-full-width-responsive="true"
            ></ins>
          </div>

          {showMacPortals && macPortals.length > 0 && (
            <section>
              <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-orange-300">
                    Mac Portal
                  </p>
                  <h3 className="mt-1 md:mt-2 text-xl md:text-2xl font-bold">Portails Mac</h3>
                </div>
                <p className="text-sm text-slate-400">{macPortals.length} portail(x)</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {macPortals.map((portal) => (
                  <article
                    key={portal._id}
                    className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 md:p-6 backdrop-blur transition hover:border-orange-500"
                  >
                    <div className="mb-2 md:mb-3 flex items-center justify-between gap-2 md:gap-3">
                      <h4 className="text-lg md:text-xl font-semibold">{portal.title}</h4>
                      <span className="text-xs text-slate-400">
                        {formatDate(portal.createdAt)}
                      </span>
                    </div>
                    <p className="mb-3 md:mb-4 text-slate-300">
                      {portal.description || 'Portail disponible'}
                    </p>
                    {portal.macAddress && (
                      <p className="mb-1 md:mb-2 text-sm">
                        <span className="text-slate-400">MAC: </span>
                        <span className="font-mono text-cyan-300 text-xs md:text-sm">{portal.macAddress}</span>
                      </p>
                    )}
                    {portal.macIdentifier && (
                      <p className="mb-2 md:mb-3 text-sm">
                        <span className="text-slate-400">ID: </span>
                        <span className="font-mono text-cyan-300 text-xs md:text-sm">{portal.macIdentifier}</span>
                      </p>
                    )}
                    <div className="flex gap-2">
                      {portal.macAddress && (
                        <button
                          onClick={() => {
                            void navigator.clipboard.writeText(portal.macAddress || '');
                            window.dispatchEvent(new CustomEvent('notice', { detail: { message: 'Adresse MAC copiée!', tone: 'success' } }));
                          }}
                          className="flex-1 rounded bg-slate-900 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                        >
                          Copier MAC
                        </button>
                      )}
                      <a
                        href={portal.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded bg-orange-600 px-4 py-2 text-center text-white transition hover:bg-orange-700"
                      >
                        Ouvrir
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className="my-8 text-center">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', minHeight: '120px' }}
              data-ad-client="ca-pub-6216012186493058"
              data-ad-slot="1234567893"
              data-ad-format="fluid"
              data-full-width-responsive="true"
            ></ins>
          </div>

          {showApps && appItems.length > 0 && (
            <section>
              <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
                    Applications
                  </p>
                  <h3 className="mt-1 md:mt-2 text-xl md:text-2xl font-bold">Applications</h3>
                </div>
                <p className="text-sm text-slate-400">{appItems.length} application(s)</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {appItems.map((app) => (
                  <article
                    key={app._id}
                    className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 md:p-6 backdrop-blur transition hover:border-cyan-500"
                  >
                    <div className="mb-2 md:mb-3 flex items-center justify-between gap-2 md:gap-3">
                      <h4 className="text-lg md:text-xl font-semibold">{app.name}</h4>
                      <span className="text-xs text-slate-400">
                        {formatDate(app.createdAt)}
                      </span>
                    </div>
                    <p className="mb-3 md:mb-4 text-slate-300">
                      {app.description || 'Application disponible au telechargement'}
                    </p>
                    <div className="mb-3 md:mb-4 text-sm text-slate-400">
                      <p>Version: {app.version || '1.0.0'}</p>
                      {app.fileSize && <p>Taille: {app.fileSize}</p>}
                    </div>
                    <a
                      href={app.downloadUrl}
                      className="block w-full rounded bg-cyan-600 px-4 py-2 text-center transition hover:bg-cyan-700"
                    >
                      Telecharger
                    </a>
                  </article>
                ))}
              </div>
            </section>
          )}

          {!hasContent && (
            <section className="py-10 md:py-16 text-center">
              <p className="mb-4 text-3xl md:text-5xl">Aucun contenu</p>
              <p className="text-lg md:text-xl text-slate-300">
                {loadError
                  ? 'Le contenu est temporairement indisponible.'
                  : 'Rien n&apos;est publie pour le moment.'}
              </p>
              <p className="text-slate-400">
                {loadError ? 'Reessayez dans un instant.' : 'Revenez un peu plus tard.'}
              </p>
            </section>
          )}
        </section>
      </main>

      <footer className="mt-10 md:mt-16 border-t border-slate-700 bg-slate-900/95">
        <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
          <div className="mb-8 rounded border border-slate-700 bg-slate-800/50 p-4 text-center">
            <div id="adsterra-home-footer-banner"></div>
          </div>
          <div className="my-8 rounded border border-slate-700 bg-slate-800/50 p-4 text-center">
            <div id="container-3b8b394af5e5faeda0898b04416b8c81"></div>
          </div>
          <div className="text-center text-sm text-slate-400">
            <p>© 2026 Ngori - Partager et decouvrir du contenu</p>
            <p>Propulse par la plateforme Ngori</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
