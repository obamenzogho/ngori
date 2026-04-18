'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

type Period = 'today' | '7d' | '30d' | '12m' | 'year';

interface KpiData { value: number; change: number; }

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
  adPerformance: { impressions: number; clicks: number; blockRate: number };
}

interface TimePoint {
  date: string;
  visitors?: number;
  uniqueVisitors?: number;
  pageViews?: number;
  clicks?: number;
}

interface VisitorsData {
  visitorsOverTime: TimePoint[];
  pageViewsOverTime: TimePoint[];
  clicksOverTime: TimePoint[];
}

const PERIOD_LABELS: Record<Period, string> = {
  today: "Aujourd'hui",
  '7d': '7 jours',
  '30d': '30 jours',
  '12m': '12 mois',
  year: 'Cette année',
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
  if (change === 0) return <span className="text-[#5C5C72] text-xs">0%</span>;
  const up = change > 0;
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
      </svg>
      {Math.abs(change)}%
    </span>
  );
}

// ── Custom Tooltip for Recharts ──────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{
      background: 'rgba(18,6,45,0.97)',
      border: '1px solid rgba(138,43,226,0.3)',
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <p style={{ color: '#9BA1B6', fontSize: '11px', marginBottom: '6px' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontSize: '13px', fontWeight: 600 }}>
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
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
        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (visitorsRes.ok) setVisitors(await visitorsRes.json());
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [period, router]);

  const handleExport = useCallback(async () => {
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
    } catch { /* silently fail */ }
  }, [period]);

  // ── Build chart dataset ──────────────────────────────────────────────────
  const chartDataRaw: TimePoint[] =
    activeChart === 'visitors'
      ? visitors?.visitorsOverTime ?? []
      : activeChart === 'pageviews'
        ? visitors?.pageViewsOverTime ?? []
        : visitors?.clicksOverTime ?? [];

  const chartLines: { key: keyof TimePoint; name: string; color: string; gradientId: string }[] =
    activeChart === 'visitors'
      ? [
          { key: 'visitors', name: 'Visiteurs', color: '#8A2BE2', gradientId: 'gradVisitors' },
          { key: 'uniqueVisitors', name: 'Uniques', color: '#00F0FF', gradientId: 'gradUnique' },
        ]
      : activeChart === 'pageviews'
        ? [{ key: 'pageViews', name: 'Pages vues', color: '#9D4EDD', gradientId: 'gradPV' }]
        : [{ key: 'clicks', name: 'Clics', color: '#FF007F', gradientId: 'gradClicks' }];

  const formatXAxis = (date: string) => {
    if (!date) return '';
    // hour format: '2025-04-18 14:00'
    if (date.includes(' ')) return date.slice(11, 16);
    // month format: '2025-04'
    if (date.length === 7) {
      const [, m] = date.split('-');
      const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
      return months[parseInt(m) - 1] ?? date;
    }
    // day: '2025-04-18'
    return date.slice(5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-[#8A2BE2]" />
          <p className="text-[#5C5C72] text-sm">Chargement des statistiques…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="container mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 pt-6 pb-2">
        <div>
          <h2 className="text-2xl font-bold text-[#F8F8FF] flex items-center gap-2">
            <svg className="w-6 h-6 text-[#8A2BE2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
            </svg>
            Analytics
          </h2>
          <p className="mt-1 text-sm text-[#646A82]">Suivi et analyse du trafic en temps réel</p>
        </div>
        <button onClick={handleExport} className="linear-btn linear-btn-ghost text-sm flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exporter
        </button>
      </div>

      <main className="container mx-auto px-4 py-4 space-y-8">
        {/* ── Period selector ───────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                period === p
                  ? 'bg-[#8A2BE2] text-white shadow-[0_0_16px_rgba(138,43,226,0.4)]'
                  : 'bg-white/[0.04] text-[#9BA1B6] hover:bg-white/[0.08] hover:text-[#F8F8FF]'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {overview && (
          <>
            {/* ── KPI Cards ────────────────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: 'Visiteurs', key: 'visitors' as const, color: '#8A2BE2', icon: '👥' },
                { label: 'Visiteurs uniques', key: 'uniqueVisitors' as const, color: '#00F0FF', icon: '👤' },
                { label: 'Pages vues', key: 'pageViews' as const, color: '#9D4EDD', icon: '📄' },
                { label: 'Clics', key: 'clicks' as const, color: '#FF007F', icon: '🖱️' },
                { label: 'Téléchargements', key: 'downloads' as const, color: '#FFD700', icon: '⬇️' },
              ].map(({ label, key, color, icon }) => (
                <div
                  key={key}
                  className="rounded-xl p-5 relative overflow-hidden"
                  style={{
                    background: 'rgba(18,6,45,0.6)',
                    border: `1px solid ${color}22`,
                    backdropFilter: 'blur(12px)',
                    boxShadow: `0 4px 24px ${color}11`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{icon}</span>
                    <ChangeIndicator change={overview.kpis[key].change} />
                  </div>
                  <p className="text-3xl font-bold" style={{ color }}>{formatNumber(overview.kpis[key].value)}</p>
                  <p className="mt-1 text-xs text-[#646A82]">{label}</p>
                  {/* Glow spot */}
                  <div style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: `radial-gradient(${color}22, transparent 70%)`,
                    transform: 'translate(30%, 30%)',
                  }} />
                </div>
              ))}
            </div>

            {/* ── Line Chart ───────────────────────────────────────────── */}
            <div className="rounded-xl p-6" style={{ background: 'rgba(18,6,45,0.6)', border: '1px solid rgba(138,43,226,0.15)', backdropFilter: 'blur(12px)' }}>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-[#F8F8FF]">Évolution temporelle</h3>
                <div className="flex gap-2">
                  {[
                    { key: 'visitors' as const, label: 'Visiteurs', color: '#8A2BE2' },
                    { key: 'pageviews' as const, label: 'Pages vues', color: '#9D4EDD' },
                    { key: 'clicks' as const, label: 'Clics', color: '#FF007F' },
                  ].map(({ key, label, color }) => (
                    <button
                      key={key}
                      onClick={() => setActiveChart(key)}
                      style={activeChart === key ? { background: color, color: '#fff', boxShadow: `0 0 12px ${color}66` } : {}}
                      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                        activeChart === key ? '' : 'bg-white/[0.04] text-[#9BA1B6] hover:bg-white/[0.08]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {chartDataRaw.length === 0 ? (
                <div className="flex h-72 items-center justify-center text-[#646A82]">
                  Aucune donnée pour cette période
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartDataRaw} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      {chartLines.map((l) => (
                        <linearGradient key={l.gradientId} id={l.gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={l.color} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={l.color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatXAxis}
                      tick={{ fill: '#646A82', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#646A82', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={formatNumber}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ color: '#9BA1B6', fontSize: '12px', paddingTop: '12px' }}
                    />
                    {chartLines.map((l) => (
                      <Area
                        key={l.key}
                        type="monotone"
                        dataKey={l.key}
                        name={l.name}
                        stroke={l.color}
                        strokeWidth={2.5}
                        fill={`url(#${l.gradientId})`}
                        dot={false}
                        activeDot={{ r: 5, fill: l.color, stroke: '#030014', strokeWidth: 2 }}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── Bottom Grid ──────────────────────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Pages */}
              <div className="rounded-xl p-6" style={{ background: 'rgba(18,6,45,0.6)', border: '1px solid rgba(138,43,226,0.12)', backdropFilter: 'blur(12px)' }}>
                <h3 className="mb-4 text-base font-bold text-[#F8F8FF] flex items-center gap-2">📄 Pages les plus visitées</h3>
                {overview.topPages.length === 0 ? (
                  <p className="text-sm text-[#646A82]">Aucune page visitée</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-xs text-[#646A82]">
                          <th className="pb-2 text-left">Page</th>
                          <th className="pb-2 text-right">Vues</th>
                          <th className="pb-2 text-right">Temps moy.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.topPages.map((page, i) => (
                          <tr key={i} className="border-b border-white/[0.04]">
                            <td className="py-2 text-[#F8F8FF] max-w-[180px] truncate">{page.page}</td>
                            <td className="py-2 text-right text-[#9BA1B6]">{formatNumber(page.views)}</td>
                            <td className="py-2 text-right text-[#9BA1B6]">{formatTime(page.avgTimeOnPage)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Device Breakdown */}
              <div className="rounded-xl p-6" style={{ background: 'rgba(18,6,45,0.6)', border: '1px solid rgba(138,43,226,0.12)', backdropFilter: 'blur(12px)' }}>
                <h3 className="mb-4 text-base font-bold text-[#F8F8FF]">📱 Répartition des appareils</h3>
                {(() => {
                  const total = Object.values(overview.deviceBreakdown).reduce((a, b) => a + b, 0);
                  if (total === 0) return <p className="text-sm text-[#646A82]">Aucune donnée</p>;
                  const devices = [
                    { key: 'mobile', label: 'Mobile', color: '#00F0FF' },
                    { key: 'desktop', label: 'Desktop', color: '#8A2BE2' },
                    { key: 'tablet', label: 'Tablette', color: '#FF007F' },
                  ];
                  return (
                    <div className="space-y-4">
                      <div className="flex h-6 overflow-hidden rounded-full gap-0.5">
                        {devices.map(({ key, color }) => {
                          const pct = total > 0 ? (overview.deviceBreakdown[key] ?? 0) / total * 100 : 0;
                          return pct > 0 ? (
                            <div key={key} style={{ width: `${pct}%`, background: color, borderRadius: '4px' }} />
                          ) : null;
                        })}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {devices.map(({ key, label, color }) => {
                          const count = overview.deviceBreakdown[key] ?? 0;
                          const pct = total > 0 ? Math.round(count / total * 100) : 0;
                          return (
                            <div key={key} className="text-center">
                              <p className="text-2xl font-bold" style={{ color }}>{pct}%</p>
                              <p className="text-xs text-[#646A82] mt-1">{label}</p>
                              <p className="text-xs text-[#9BA1B6]">{formatNumber(count)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Country Breakdown */}
              <div className="rounded-xl p-6" style={{ background: 'rgba(18,6,45,0.6)', border: '1px solid rgba(138,43,226,0.12)', backdropFilter: 'blur(12px)' }}>
                <h3 className="mb-4 text-base font-bold text-[#F8F8FF]">🌍 Pays des visiteurs</h3>
                {overview.countryBreakdown.length === 0 ? (
                  <p className="text-sm text-[#646A82]">Aucune donnée de géolocalisation</p>
                ) : (
                  <div className="space-y-2">
                    {overview.countryBreakdown.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-lg w-8">{item.country}</span>
                        <div className="flex-1">
                          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div style={{ width: `${item.percentage}%`, background: 'linear-gradient(to right, #8A2BE2, #00F0FF)', borderRadius: '4px', height: '100%', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                        <span className="text-xs text-[#9BA1B6] w-16 text-right">{formatNumber(item.visitors)} ({item.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Searches */}
              <div className="rounded-xl p-6" style={{ background: 'rgba(18,6,45,0.6)', border: '1px solid rgba(138,43,226,0.12)', backdropFilter: 'blur(12px)' }}>
                <h3 className="mb-4 text-base font-bold text-[#F8F8FF]">🔍 Recherches populaires</h3>
                {overview.topSearches.length === 0 ? (
                  <p className="text-sm text-[#646A82]">Aucune recherche enregistrée</p>
                ) : (
                  <div className="space-y-2">
                    {overview.topSearches.map((search, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: '#8A2BE2', color: '#fff' }}>{i + 1}</span>
                        <p className="flex-1 truncate text-sm text-[#F8F8FF]">{search.query}</p>
                        <p className="text-sm font-bold text-[#9BA1B6]">{search.count}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Clicks */}
              <div className="rounded-xl p-6" style={{ background: 'rgba(18,6,45,0.6)', border: '1px solid rgba(138,43,226,0.12)', backdropFilter: 'blur(12px)' }}>
                <h3 className="mb-4 text-base font-bold text-[#F8F8FF]">🖱️ Clics les plus fréquents</h3>
                {overview.topClicks.length === 0 ? (
                  <p className="text-sm text-[#646A82]">Aucun clic enregistré</p>
                ) : (
                  <div className="space-y-2">
                    {overview.topClicks.map((click, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: '#FF007F22', color: '#FF007F', border: '1px solid #FF007F44' }}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-[#F8F8FF]">{click.label || click.element}</p>
                          <p className="text-xs text-[#646A82]">{click.element}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#FF007F]">{formatNumber(click.clicks)}</p>
                          <p className="text-xs text-[#646A82]">{click.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ad Performance */}
              <div className="rounded-xl p-6" style={{ background: 'rgba(18,6,45,0.6)', border: '1px solid rgba(138,43,226,0.12)', backdropFilter: 'blur(12px)' }}>
                <h3 className="mb-4 text-base font-bold text-[#F8F8FF]">📢 Performance publicitaire</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Impressions', value: formatNumber(overview.adPerformance.impressions), color: '#00F0FF' },
                    { label: 'Clics pub', value: formatNumber(overview.adPerformance.clicks), color: '#8A2BE2' },
                    { label: 'Taux blocage', value: `${overview.adPerformance.blockRate}%`, color: '#FF3333' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-lg p-4 text-center" style={{ background: `${color}08`, border: `1px solid ${color}22` }}>
                      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                      <p className="mt-1 text-xs text-[#646A82]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {!overview && !loading && (
          <div className="rounded-xl p-12 text-center" style={{ background: 'rgba(18,6,45,0.6)', border: '1px solid rgba(138,43,226,0.12)' }}>
            <p className="text-5xl mb-4">📊</p>
            <h3 className="text-xl font-bold text-[#F8F8FF]">Aucune donnée disponible</h3>
            <p className="mt-2 text-sm text-[#646A82]">Les statistiques apparaîtront dès que des visiteurs navigueront sur le site.</p>
          </div>
        )}
      </main>
    </>
  );
}
