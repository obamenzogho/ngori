'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Period = 'today' | '7d' | '30d' | '12m' | 'year';

interface KpiData {
  value: number;
  change: number;
}

interface OverviewData {
  period: string;
  kpis: {
    visitors: KpiData;
    uniqueVisitors: KpiData;
    pageViews: KpiData;
    clicks: KpiData;
    downloads: KpiData;
  };
  topPages: { page: string; views: number; avgTimeOnPage: number }[];
  topClicks: { element: string; label: string; clicks: number; percentage: number }[];
  deviceBreakdown: Record<string, number>;
  countryBreakdown: { country: string; visitors: number; percentage: number }[];
  topSearches: { query: string; count: number }[];
  adPerformance: {
    impressions: number;
    clicks: number;
    blockRate: number;
  };
}

interface VisitorsData {
  visitorsOverTime: { date: string; visitors: number; uniqueVisitors: number }[];
  pageViewsOverTime: { date: string; pageViews: number }[];
  clicksOverTime: { date: string; clicks: number }[];
}

const PERIOD_LABELS: Record<Period, string> = {
  today: "Aujourd'hui",
  '7d': '7 jours',
  '30d': '30 jours',
  '12m': '12 mois',
  year: 'Cette année',
};

const COUNTRY_FLAGS: Record<string, string> = {
  GA: '🇬🇦', CI: '🇨🇮', FR: '🇫🇷', CM: '🇨🇲', SN: '🇸🇳',
  ML: '🇲🇱', BF: '🇧🇫', NE: '🇳🇪', TG: '🇹🇬', BJ: '🇧🇯',
  GN: '🇬🇳', TD: '🇹🇩', CF: '🇨🇫', CG: '🇨🇬', CD: '🇨🇩',
  MG: '🇲🇬', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', IT: '🇮🇹',
  ES: '🇪🇸', PT: '🇵🇹', BE: '🇧🇪', CH: '🇨🇭', CA: '🇨🇦',
  MA: '🇲🇦', TN: '🇹🇳', DZ: '🇩🇿', NG: '🇳🇬', KE: '🇰🇪',
};

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatTime(seconds: number): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

function ChangeIndicator({ change }: { change: number }) {
  if (change === 0) return <span className="text-[#5C5C72]">0%</span>;
  return (
    <span className={`flex items-center gap-1 text-sm font-semibold ${change > 0 ? 'text-[#4ADE80]' : 'text-red-400'}`}>
      {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
    </span>
  );
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('7d');
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [visitors, setVisitors] = useState<VisitorsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'visitors' | 'pageviews' | 'clicks'>('visitors');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [overviewRes, visitorsRes] = await Promise.all([
          fetch(`/api/analytics/overview?period=${period}`),
          fetch(`/api/analytics/visitors?period=${period}&groupBy=${period === 'today' ? 'hour' : 'day'}`),
        ]);

        if (overviewRes.status === 401 || visitorsRes.status === 401) {
          router.push('/admin/login');
          return;
        }

        if (overviewRes.ok) {
          setOverview(await overviewRes.json());
        }
        if (visitorsRes.ok) {
          setVisitors(await visitorsRes.json());
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [period, router]);

  const handleExportCsv = useCallback(async () => {
    try {
      const res = await fetch(`/api/analytics/overview?period=${period}`);
      if (!res.ok) return;
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${period}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    }
  }, [period]);

  // Chart data
  const chartData = visitors
    ? activeChart === 'visitors'
      ? visitors.visitorsOverTime
      : activeChart === 'pageviews'
        ? visitors.pageViewsOverTime
        : visitors.clicksOverTime
    : [];

  const chartMax = chartData.length > 0
    ? Math.max(...chartData.map((d: { visitors?: number; pageViews?: number; clicks?: number; uniqueVisitors?: number }) =>
        d.visitors || d.pageViews || d.clicks || 0
      ))
    : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white" />
          <p className="text-[#5C5C72]">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page title & Export */}
      <div className="container mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 pt-6 pb-2">
        <div>
          <h2 className="text-2xl font-bold text-[#E8E8ED]">
            📊 Analytics
          </h2>
          <p className="mt-1 text-sm text-[#5C5C72]">
            Suivi et analyse du trafic en temps réel
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="linear-btn linear-btn-ghost text-sm"
        >
          📥 Exporter
        </button>
      </div>

      <main className="container mx-auto px-4 py-4">
        {/* Period selector */}
        <div className="mb-8 flex flex-wrap gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                period === p
                  ? 'bg-[#5E6AD2] text-[#E8E8ED]'
                  : 'bg-white/[0.04] text-[#8B8B9E] hover:bg-white/[0.08] hover:text-[#E8E8ED]'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {overview && (
          <>
            {/* Section 1 — KPIs */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: 'Visiteurs', key: 'visitors' as const, icon: '👥' },
                { label: 'Visiteurs uniques', key: 'uniqueVisitors' as const, icon: '👤' },
                { label: 'Pages vues', key: 'pageViews' as const, icon: '📄' },
                { label: 'Clics', key: 'clicks' as const, icon: '👆' },
                { label: 'Téléchargements', key: 'downloads' as const, icon: '📥' },
              ].map(({ label, key, icon }) => (
                <div
                  key={key}
                  className="rounded-xl border border-white/[0.06] bg-[#111118] p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{icon}</span>
                    <ChangeIndicator change={overview.kpis[key].change} />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-[#E8E8ED]">
                    {formatNumber(overview.kpis[key].value)}
                  </p>
                  <p className="mt-1 text-sm text-[#5C5C72]">{label}</p>
                </div>
              ))}
            </div>

            {/* Section 2 — Charts */}
            <div className="mb-8 rounded-xl border border-white/[0.06] bg-[#111118] p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-[#E8E8ED]">Évolution temporelle</h2>
                <div className="flex gap-2">
                  {[
                    { key: 'visitors' as const, label: 'Visiteurs' },
                    { key: 'pageviews' as const, label: 'Pages vues' },
                    { key: 'clicks' as const, label: 'Clics' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveChart(key)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        activeChart === key
                          ? 'bg-[#5E6AD2] text-[#E8E8ED]'
                          : 'bg-white/[0.04] text-[#8B8B9E] hover:bg-white/[0.08] hover:text-[#E8E8ED]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simple bar chart */}
              <div className="flex h-64 items-end gap-1 overflow-x-auto pb-2">
                {chartData.map((item, i) => {
                  const value = (item as Record<string, unknown>).visitors || (item as Record<string, unknown>).pageViews || (item as Record<string, unknown>).clicks || 0;
                  const height = chartMax > 0 ? (Number(value) / chartMax) * 100 : 0;
                  const dateLabel = item.date?.slice(-5) || `${i}`;

                  return (
                    <div
                      key={i}
                      className="group relative flex min-w-[24px] flex-1 flex-col items-center"
                    >
                      <div className="absolute -top-8 hidden rounded bg-[#0A0A0F] px-2 py-1 text-xs text-[#E8E8ED] group-hover:block">
                        {formatNumber(Number(value))}
                      </div>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-[#5E6AD2] to-[#7C6BF7] transition-all duration-200 hover:from-blue-500 hover:to-cyan-300"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      <span className="mt-2 text-[10px] text-[#5C5C72]">{dateLabel}</span>
                    </div>
                  );
                })}
              </div>
              {chartData.length === 0 && (
                <div className="flex h-64 items-center justify-center text-[#5C5C72]">
                  Aucune donnée pour cette période
                </div>
              )}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Section 3 — Top Clicks */}
              <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
                <h2 className="mb-4 text-lg font-bold text-[#E8E8ED]">👆 Clics les plus fréquents</h2>
                {overview.topClicks.length === 0 ? (
                  <p className="text-sm text-[#5C5C72]">Aucun clic enregistré</p>
                ) : (
                  <div className="space-y-3">
                    {overview.topClicks.map((click, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0A0A0F] px-4 py-3"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5E6AD2] text-xs font-bold text-[#E8E8ED]">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-[#E8E8ED]">
                            {click.label || click.element}
                          </p>
                          <p className="text-xs text-[#5C5C72]">{click.element}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#E8E8ED]">{formatNumber(click.clicks)}</p>
                          <p className="text-xs text-[#5C5C72]">{click.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4 — Top Pages */}
              <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
                <h2 className="mb-4 text-lg font-bold text-[#E8E8ED]">📄 Pages les plus visitées</h2>
                {overview.topPages.length === 0 ? (
                  <p className="text-sm text-[#5C5C72]">Aucune page visitée</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-xs text-[#5C5C72]">
                          <th className="pb-2 text-left">Page</th>
                          <th className="pb-2 text-right">Vues</th>
                          <th className="pb-2 text-right">Temps moyen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.topPages.map((page, i) => (
                          <tr key={i} className="border-b border-white/[0.04]">
                            <td className="py-2 text-[#E8E8ED]">{page.page}</td>
                            <td className="py-2 text-right text-[#8B8B9E]">{formatNumber(page.views)}</td>
                            <td className="py-2 text-right text-[#8B8B9E]">{formatTime(page.avgTimeOnPage)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section 5 — Device Breakdown */}
              <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
                <h2 className="mb-4 text-lg font-bold text-[#E8E8ED]">📱 Répartition des appareils</h2>
                {(() => {
                  const total = Object.values(overview.deviceBreakdown).reduce((a, b) => a + b, 0);
                  if (total === 0) return <p className="text-sm text-[#5C5C72]">Aucune donnée</p>;

                  const devices = [
                    { key: 'desktop', label: 'Desktop', icon: '🖥️', color: 'bg-[#5E6AD2]' },
                    { key: 'mobile', label: 'Mobile', icon: '📱', color: 'bg-[#4ADE80]' },
                    { key: 'tablet', label: 'Tablette', icon: '📟', color: 'bg-[#D4A843]' },
                  ];

                  return (
                    <div className="space-y-4">
                      {/* Bar */}
                      <div className="flex h-8 overflow-hidden rounded-full">
                        {devices.map(({ key, color }) => {
                          const count = overview.deviceBreakdown[key] || 0;
                          const pct = total > 0 ? (count / total) * 100 : 0;
                          return pct > 0 ? (
                            <div
                              key={key}
                              className={`${color} flex items-center justify-center text-xs font-bold text-[#E8E8ED] transition-all`}
                              style={{ width: `${pct}%` }}
                            >
                              {pct >= 10 ? `${Math.round(pct)}%` : ''}
                            </div>
                          ) : null;
                        })}
                      </div>

                      {/* Legend */}
                      <div className="grid grid-cols-3 gap-4">
                        {devices.map(({ key, label, icon }) => {
                          const count = overview.deviceBreakdown[key] || 0;
                          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                          return (
                            <div key={key} className="text-center">
                              <span className="text-2xl">{icon}</span>
                              <p className="mt-1 text-lg font-bold text-[#E8E8ED]">{pct}%</p>
                              <p className="text-xs text-[#5C5C72]">{label}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Section 6 — Country Breakdown */}
              <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
                <h2 className="mb-4 text-lg font-bold text-[#E8E8ED]">🌍 Pays des visiteurs</h2>
                {overview.countryBreakdown.length === 0 ? (
                  <p className="text-sm text-[#5C5C72]">Aucune donnée de géolocalisation</p>
                ) : (
                  <div className="space-y-3">
                    {overview.countryBreakdown.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0A0A0F] px-4 py-3"
                      >
                        <span className="text-xl">
                          {COUNTRY_FLAGS[item.country] || '🏳️'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#E8E8ED]">{item.country}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#E8E8ED]">{formatNumber(item.visitors)}</p>
                          <p className="text-xs text-[#5C5C72]">{item.percentage}%</p>
                        </div>
                        {/* Mini bar */}
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#5E6AD2] to-[#7C6BF7]"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 7 — Top Searches */}
              <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
                <h2 className="mb-4 text-lg font-bold text-[#E8E8ED]">🔍 Recherches populaires</h2>
                {overview.topSearches.length === 0 ? (
                  <p className="text-sm text-[#5C5C72]">Aucune recherche enregistrée</p>
                ) : (
                  <div className="space-y-2">
                    {overview.topSearches.map((search, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0A0A0F] px-4 py-2"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7C6BF7] text-xs font-bold text-[#E8E8ED]">
                          {i + 1}
                        </span>
                        <p className="flex-1 text-sm text-[#E8E8ED]">{search.query}</p>
                        <p className="text-sm font-bold text-[#8B8B9E]">{search.count}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 8 — Ad Performance */}
              <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
                <h2 className="mb-4 text-lg font-bold text-[#E8E8ED]">💰 Performance publicitaire</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-[#4ADE80]/20 bg-[#4ADE80]/5 p-4 text-center">
                    <p className="text-3xl font-bold text-[#4ADE80]">
                      {formatNumber(overview.adPerformance.impressions)}
                    </p>
                    <p className="mt-1 text-sm text-[#5C5C72]">Impressions</p>
                  </div>
                  <div className="rounded-lg border border-[#5E6AD2]/20 bg-[#5E6AD2]/5 p-4 text-center">
                    <p className="text-3xl font-bold text-[#8B93E6]">
                      {formatNumber(overview.adPerformance.clicks)}
                    </p>
                    <p className="mt-1 text-sm text-[#5C5C72]">Clics pub</p>
                  </div>
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center">
                    <p className="text-3xl font-bold text-red-400">
                      {overview.adPerformance.blockRate}%
                    </p>
                    <p className="mt-1 text-sm text-[#5C5C72]">Taux de blocage</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!overview && !loading && (
          <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-12 text-center">
            <p className="text-5xl">📊</p>
            <h2 className="mt-4 text-xl font-bold text-[#E8E8ED]">Aucune donnée disponible</h2>
            <p className="mt-2 text-sm text-[#5C5C72]">
              Les statistiques apparaîtront dès que des visiteurs navigueront sur le site.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
