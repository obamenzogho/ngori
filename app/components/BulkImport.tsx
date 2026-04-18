'use client';

import { useState, useMemo, useCallback, ReactNode } from 'react';

type ContentType = 'playlists' | 'xtream' | 'mac-portal';

type DetectedType = 'M3U' | 'XTREAM' | 'MAC_PORTAL' | 'UNKNOWN';

interface ExpirationInfo {
  expirationDate: string | null;
  status: string;
  maxConnections: number;
  activeConnections: number;
  isTrial: boolean;
}

interface CategoriesInfo {
  liveCategories: string[];
  vodCategories: string[];
  seriesCategories: string[];
  totalLive: number;
  totalVod: number;
  totalSeries: number;
}

interface AnalyzedEntry {
  url: string;
  type: DetectedType;
  title: string;
  description: string;
  expiration: ExpirationInfo;
  categories: CategoriesInfo;
  serverUrl?: string;
  username?: string;
  password?: string;
  macAddress?: string;
  portalUrl?: string;
  error?: string;
  selected: boolean;
  analyzing: boolean;
}

interface BulkImportProps {
  activeTab: ContentType;
  onImportComplete: () => void;
}

function getStatusColor(entry: AnalyzedEntry): 'green' | 'yellow' | 'red' {
  if (entry.error || entry.expiration.status === 'error' || entry.expiration.status === 'invalid_credentials' || entry.type === 'UNKNOWN') {
    return 'red';
  }
  if (entry.expiration.expirationDate) {
    const expDate = new Date(entry.expiration.expirationDate);
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (expDate < now) return 'red';
    if (expDate.getTime() - now.getTime() < thirtyDays) return 'yellow';
  }
  return 'green';
}

function getStatusEmoji(entry: AnalyzedEntry): React.ReactNode {
  const color = getStatusColor(entry);
  if (color === 'red') return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="#EF4444">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
  if (color === 'yellow') return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="#EAB308">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="#22C55E">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function getStatusLabel(entry: AnalyzedEntry): string {
  if (entry.analyzing) return 'Analyse...';
  if (entry.error) return entry.error;
  if (entry.type === 'UNKNOWN') return 'Format non reconnu';
  if (entry.expiration.status === 'invalid_credentials') return 'Identifiants invalides';
  if (entry.expiration.status === 'server_error') return 'Serveur inaccessible';
  if (entry.expiration.status === 'error') return 'Serveur inaccessible';
  if (entry.expiration.expirationDate) {
    const expDate = new Date(entry.expiration.expirationDate);
    if (expDate < new Date()) return 'Expiré';
    return `Expire le ${expDate.toLocaleDateString('fr-FR')}`;
  }
  return 'Actif';
}

function getTypeLabel(type: DetectedType): string {
  switch (type) {
    case 'M3U': return 'M3U';
    case 'XTREAM': return 'Xtream';
    case 'MAC_PORTAL': return 'Mac Portal';
    default: return 'Inconnu';
  }
}

function mapTypeToContentType(type: DetectedType): ContentType {
  switch (type) {
    case 'M3U': return 'playlists';
    case 'XTREAM': return 'xtream';
    case 'MAC_PORTAL': return 'mac-portal';
    default: return 'playlists';
  }
}

export default function BulkImport({ activeTab, onImportComplete }: BulkImportProps) {
  const [rawUrls, setRawUrls] = useState('');
  const [entries, setEntries] = useState<AnalyzedEntry[]>([]);
  const [step, setStep] = useState<'input' | 'analyzing' | 'preview' | 'importing' | 'done'>('input');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<{
    successCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);

  const handleAnalyze = useCallback(async () => {
    const urls = rawUrls.split('\n').map((u) => u.trim()).filter(Boolean);
    if (urls.length === 0) return;

    const initialEntries: AnalyzedEntry[] = urls.map((url) => ({
      url,
      type: 'UNKNOWN' as DetectedType,
      title: '',
      description: '',
      expiration: {
        expirationDate: null,
        status: 'unknown',
        maxConnections: 0,
        activeConnections: 0,
        isTrial: false,
      },
      categories: {
        liveCategories: [],
        vodCategories: [],
        seriesCategories: [],
        totalLive: 0,
        totalVod: 0,
        totalSeries: 0,
      },
      selected: false,
      analyzing: true,
    }));

    setEntries(initialEntries);
    setStep('analyzing');
    setProgress({ current: 0, total: urls.length });

    // Analyze URLs one by one to show progress
    for (let i = 0; i < urls.length; i++) {
      try {
        const response = await fetch('/api/admin/analyze-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urls[i] }),
        });

        if (response.ok) {
          const data = (await response.json()) as Omit<AnalyzedEntry, 'selected' | 'analyzing'>;

          setEntries((prev) =>
            prev.map((entry, idx) =>
              idx === i
                ? {
                    ...entry,
                    ...data,
                    selected: !data.error && data.type !== 'UNKNOWN',
                    analyzing: false,
                  }
                : entry,
            ),
          );
        } else {
          setEntries((prev) =>
            prev.map((entry, idx) =>
              idx === i
                ? {
                    ...entry,
                    error: 'Erreur serveur',
                    analyzing: false,
                  }
                : entry,
            ),
          );
        }
      } catch {
        setEntries((prev) =>
          prev.map((entry, idx) =>
            idx === i
              ? {
                  ...entry,
                  error: 'Erreur réseau',
                  analyzing: false,
                }
              : entry,
          ),
        );
      }

      setProgress((prev) => ({ ...prev, current: i + 1 }));
    }

    setStep('preview');
  }, [rawUrls]);

  const toggleEntry = (index: number) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, selected: !entry.selected } : entry,
      ),
    );
  };

  const toggleAll = () => {
    const selectableEntries = entries.filter((e) => !e.analyzing);
    const allSelected = selectableEntries.length > 0 && selectableEntries.every((e) => e.selected);
    setEntries((prev) =>
      prev.map((entry) => ({
        ...entry,
        selected: !allSelected,
      })),
    );
  };

  const updateEntryTitle = (index: number, title: string) => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, title } : entry)),
    );
  };

  const updateEntryDescription = (index: number, description: string) => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, description } : entry)),
    );
  };

  const selectedEntries = useMemo(
    () => entries.filter((e) => e.selected),
    [entries],
  );

  const handleImport = async () => {
    setStep('importing');
    setProgress({ current: 0, total: selectedEntries.length });

    let totalSuccess = 0;
    let totalErrors = 0;
    const errorMessages: string[] = [];

    // Group entries by type for batch import
    const grouped = new Map<ContentType, AnalyzedEntry[]>();
    for (const entry of selectedEntries) {
      const type = mapTypeToContentType(entry.type);
      const group = grouped.get(type) || [];
      group.push(entry);
      grouped.set(type, group);
    }

    let processed = 0;

    for (const [type, group] of grouped) {
      const items = group.map((entry) => {
        const base: Record<string, unknown> = {
          title: entry.title,
          description: entry.description,
          isActive: true,
        };

        if (entry.type === 'M3U') {
          base.content = entry.url;
          base.category = 'IPTV';
        } else if (entry.type === 'XTREAM') {
          base.serverUrl = entry.serverUrl || '';
          base.username = entry.username || '';
          base.password = entry.password || '';
          base.category = 'IPTV';
          if (entry.expiration.expirationDate) {
            base.expirationDate = entry.expiration.expirationDate;
          }
        } else if (entry.type === 'MAC_PORTAL') {
          base.portalUrl = entry.portalUrl || entry.url;
          if (entry.macAddress) {
            base.macAddress = entry.macAddress;
          }
          base.category = 'IPTV';
        }

        return base;
      });

      try {
        const response = await fetch(`/api/admin/${type}/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });

        if (response.status === 401) {
          window.location.href = '/admin/login';
          return;
        }

        const data = await response.json();

        if (data.results) {
          data.results.forEach(
            (r: { success: boolean; error?: string }, idx: number) => {
              if (r.success) {
                totalSuccess++;
              } else {
                totalErrors++;
                errorMessages.push(
                  `${group[idx].title}: ${r.error || 'Erreur inconnue'}`,
                );
              }
            },
          );
        } else if (!response.ok) {
          totalErrors += items.length;
          errorMessages.push(data.error || 'Erreur serveur');
        }
      } catch {
        totalErrors += items.length;
        errorMessages.push('Erreur réseau');
      }

      processed += group.length;
      setProgress({ current: processed, total: selectedEntries.length });
    }

    setImportResult({ successCount: totalSuccess, errorCount: totalErrors, errors: errorMessages });
    setStep('done');
    onImportComplete();
  };

  const handleReset = () => {
    setRawUrls('');
    setEntries([]);
    setStep('input');
    setImportResult(null);
    setProgress({ current: 0, total: 0 });
  };

  // ─── Step: Input ───
  if (step === 'input') {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#E8E8ED] flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Import en masse automatisé
          </h2>
          <p className="mt-1 text-sm text-[#5C5C72]">
            Collez vos URLs brutes ci-dessous, une par ligne. Le système détecte automatiquement le type
            (M3U, Xtream, Mac Portal) et analyse chaque URL.
          </p>
        </div>

        <div className="mb-4 rounded-lg border border-white/[0.06] bg-[#0A0A0F] p-3">
          <p className="mb-2 text-xs font-semibold text-[#8B8B9E]">Formats supportés :</p>
          <div className="space-y-1 text-xs text-[#8B93E6] font-mono">
            <p>M3U : http://serveur.com/get.php?username=user&password=pass&type=m3u</p>
            <p>Xtream : http://serveur.com:8080/get.php?username=user&password=pass</p>
            <p>Mac Portal : http://portail.com/c/00:1A:79:XX:XX:XX</p>
          </div>
        </div>

        <textarea
          value={rawUrls}
          onChange={(e) => setRawUrls(e.target.value)}
          placeholder="http://serveur1.com/get.php?username=user1&password=pass1&type=m3u&#10;http://serveur2.com:8080/get.php?username=user2&password=pass2&#10;http://portail3.com/c/00:1A:79:XX:XX:XX"
          rows={10}
          className="mb-4 w-full rounded-lg border border-white/[0.06] bg-[#0A0A0F] px-4 py-3 font-mono text-sm text-[#E8E8ED] placeholder-[#5C5C72] outline-none transition focus:border-[#5E6AD2]"
        />

        <div className="flex items-center gap-4">
          <button
            onClick={handleAnalyze}
            disabled={!rawUrls.trim()}
            className="linear-btn linear-btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Analyser les URLs
          </button>
          {rawUrls.trim() && (
            <span className="text-sm text-[#5C5C72]">
              {rawUrls.split('\n').filter((l) => l.trim()).length} URL(s) détectée(s)
            </span>
          )}
        </div>
      </div>
    );
  }

  // ─── Step: Analyzing ───
  if (step === 'analyzing') {
    const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#5E6AD2]" />
          <h2 className="text-xl font-bold text-[#E8E8ED]">Analyse en cours...</h2>
          <p className="mt-1 text-sm text-[#5C5C72]">
            {progress.current} / {progress.total} URLs analysées
          </p>
        </div>

        <div className="mb-4 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-[#5E6AD2] to-[#7C6BF7] transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-center text-sm text-[#5C5C72]">{percent}%</p>

        {/* Show entries as they are analyzed */}
        <div className="mt-6 max-h-60 space-y-2 overflow-y-auto">
          {entries.map((entry, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                entry.analyzing
                  ? 'border-white/[0.06] bg-[#0A0A0F]'
                  : entry.error || entry.type === 'UNKNOWN'
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'border-[#4ADE80]/20 bg-[#4ADE80]/5'
              }`}
            >
              <span className="text-xs text-[#5C5C72]">
                      {entry.analyzing ? (
                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      ) : getStatusEmoji(entry)}
                    </span>
              <span className="flex-1 truncate text-[#8B8B9E]">{entry.url}</span>
              {!entry.analyzing && (
                <span className="text-xs text-[#5C5C72]">{getTypeLabel(entry.type)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Step: Preview ───
  if (step === 'preview') {
    const validCount = entries.filter((e) => e.type !== 'UNKNOWN' && !e.error).length;
    const errorCount = entries.filter((e) => e.type === 'UNKNOWN' || e.error).length;

    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#E8E8ED]">📋 Résultats de l'analyse</h2>
            <p className="mt-1 text-sm text-[#5C5C72]">
              Vérifiez les entrées ci-dessous. Modifiez les titres/descriptions si besoin, puis publiez.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="linear-btn linear-btn-ghost text-sm"
          >
            Retour
          </button>
        </div>

        {/* Stats */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="rounded-lg border border-[#4ADE80]/20 bg-[#4ADE80]/10 px-4 py-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#4ADE80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12 12 15 16 10" />
            </svg>
            <span className="text-sm text-[#4ADE80]">{validCount} valide(s)</span>
          </div>
          {errorCount > 0 && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span className="text-sm text-red-400">{errorCount} erreur(s)</span>
            </div>
          )}
          <div className="rounded-lg border border-[#5E6AD2]/20 bg-[#5E6AD2]/10 px-4 py-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#8B93E6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span className="text-sm text-[#8B93E6]">{selectedEntries.length} sélectionnée(s)</span>
          </div>
        </div>

        {/* Table */}
        <div className="mb-4 overflow-x-auto rounded-lg border border-white/[0.06]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/[0.06] bg-[#0A0A0F]">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={entries.length > 0 && entries.filter((e) => !e.analyzing).every((e) => e.selected)}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-white/[0.12] bg-[#0A0A0F]"
                  />
                </th>
                <th className="px-3 py-3 text-xs font-semibold text-[#8B8B9E]">Statut</th>
                <th className="px-3 py-3 text-xs font-semibold text-[#8B8B9E]">Type</th>
                <th className="px-3 py-3 text-xs font-semibold text-[#8B8B9E]">Titre</th>
                <th className="px-3 py-3 text-xs font-semibold text-[#8B8B9E]">Description</th>
                <th className="px-3 py-3 text-xs font-semibold text-[#8B8B9E]">Expiration</th>
                <th className="px-3 py-3 text-xs font-semibold text-[#8B8B9E]">Contenu</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={index}
                  className={`border-b border-white/[0.04] ${
                    entry.selected ? 'bg-white/[0.02]' : 'bg-[#0A0A0F] opacity-60'
                  }`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={entry.selected}
                      onChange={() => toggleEntry(index)}
                      className="h-4 w-4 rounded border-white/[0.12] bg-[#0A0A0F]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className="cursor-help" title={getStatusLabel(entry)}>
                      {getStatusEmoji(entry)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      entry.type === 'M3U' ? 'bg-blue-500/15 text-[#8B93E6]' :
                      entry.type === 'XTREAM' ? 'bg-[#7C6BF7]/15 text-[#A5A0F5]' :
                      entry.type === 'MAC_PORTAL' ? 'bg-[#D4A843]/15 text-[#D4A843]' :
                      'bg-red-500/15 text-red-400'
                    }`}>
                      {getTypeLabel(entry.type)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={entry.title}
                      onChange={(e) => updateEntryTitle(index, e.target.value)}
                      className="w-full min-w-[120px] rounded border border-white/[0.06] bg-[#0A0A0F] px-2 py-1 text-sm text-[#E8E8ED] outline-none focus:border-[#5E6AD2]"
                    />
                  </td>
                  <td className="max-w-[250px] px-3 py-2">
                    <textarea
                      value={entry.description}
                      onChange={(e) => updateEntryDescription(index, e.target.value)}
                      rows={2}
                      className="w-full rounded border border-white/[0.06] bg-[#0A0A0F] px-2 py-1 text-xs text-[#8B8B9E] outline-none focus:border-[#5E6AD2]"
                    />
                  </td>
                  <td className="px-3 py-2 text-xs text-[#8B8B9E]">
                    {entry.expiration.expirationDate
                      ? new Date(entry.expiration.expirationDate).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-[#8B8B9E]">
                    {entry.categories.totalLive > 0 && <span className="mr-2 inline-flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                      {entry.categories.totalLive}
                    </span>}
                    {entry.categories.totalVod > 0 && <span className="mr-2 inline-flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg>
                      {entry.categories.totalVod}
                    </span>}
                    {entry.categories.totalSeries > 0 && <span className="mr-2 inline-flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /></svg>
                      {entry.categories.totalSeries}
                    </span>}
                    {entry.categories.totalLive === 0 && entry.categories.totalVod === 0 && entry.categories.totalSeries === 0 && '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleImport}
            disabled={selectedEntries.length === 0}
            className="linear-btn linear-btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Publier {selectedEntries.length} entrée(s)
          </button>
          <button
            onClick={handleReset}
            className="linear-btn linear-btn-ghost"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  // ─── Step: Importing ───
  if (step === 'importing') {
    const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#5E6AD2]" />
          <h2 className="text-xl font-bold text-[#E8E8ED]">Import en cours...</h2>
          <p className="mt-1 text-sm text-[#5C5C72]">
            {progress.current} / {progress.total} entrées traitées
          </p>
        </div>

        <div className="mb-4 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-[#4ADE80] to-[#7C6BF7] transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-center text-sm text-[#5C5C72]">{percent}%</p>
      </div>
    );
  }

  // ─── Step: Done ───
  if (step === 'done' && importResult) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 text-5xl">
            {importResult.errorCount === 0 ? (
              <svg className="w-16 h-16 mx-auto text-[#4ADE80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 12 15 16 10" />
              </svg>
            ) : (
              <svg className="w-16 h-16 mx-auto text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>
          <h2 className="text-xl font-bold text-[#E8E8ED]">Import terminé</h2>
        </div>

        <div className="mb-6 flex justify-center gap-6">
          <div className="rounded-lg border border-[#4ADE80]/20 bg-[#4ADE80]/10 px-6 py-4 text-center">
            <p className="text-3xl font-bold text-[#4ADE80]">{importResult.successCount}</p>
            <p className="mt-1 text-sm text-[#4ADE80]">Réussite(s)</p>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-6 py-4 text-center">
            <p className="text-3xl font-bold text-red-400">{importResult.errorCount}</p>
            <p className="mt-1 text-sm text-red-400">Erreur(s)</p>
          </div>
        </div>

        {importResult.errors.length > 0 && (
          <div className="mb-6 max-h-40 overflow-y-auto rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <p className="mb-2 text-xs font-semibold text-red-400">Détails des erreurs :</p>
            <ul className="space-y-1">
              {importResult.errors.map((err, i) => (
                <li key={i} className="text-xs text-red-400">• {err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button
            onClick={handleReset}
            className="rounded-lg bg-[#5E6AD2] px-6 py-3 font-semibold text-[#E8E8ED] transition hover:bg-blue-700"
          >
            Nouvel import
          </button>
        </div>
      </div>
    );
  }

  return null;
}
