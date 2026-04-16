'use client';

import { useState, useMemo, useCallback } from 'react';

type ContentType = 'playlists' | 'xtream' | 'mac-portal';

interface ParsedEntry {
  raw: string;
  valid: boolean;
  errors: string[];
  data: Record<string, string | boolean>;
  selected: boolean;
}

interface BulkImportProps {
  activeTab: ContentType;
  onImportComplete: () => void;
}

interface ColumnDef {
  key: string;
  label: string;
  required: boolean;
}

const COLUMNS: Record<ContentType, ColumnDef[]> = {
  playlists: [
    { key: 'title', label: 'Titre', required: true },
    { key: 'content', label: 'Contenu M3U / URL', required: true },
    { key: 'category', label: 'Catégorie', required: false },
    { key: 'description', label: 'Description', required: false },
    { key: 'logo', label: 'Logo (URL)', required: false },
  ],
  xtream: [
    { key: 'title', label: 'Titre', required: true },
    { key: 'serverUrl', label: 'URL serveur', required: true },
    { key: 'username', label: 'Utilisateur', required: true },
    { key: 'password', label: 'Mot de passe', required: true },
    { key: 'expirationDate', label: 'Date expiration', required: false },
    { key: 'category', label: 'Catégorie', required: false },
  ],
  'mac-portal': [
    { key: 'title', label: 'Titre', required: true },
    { key: 'portalUrl', label: 'URL portail', required: true },
    { key: 'macAddress', label: 'Adresse MAC', required: false },
    { key: 'macIdentifier', label: 'Identifiant MAC', required: false },
    { key: 'category', label: 'Catégorie', required: false },
    { key: 'logo', label: 'Logo (URL)', required: false },
  ],
};

const FORMAT_HINTS: Record<ContentType, string> = {
  playlists:
    'titre|contenu_m3u|catégorie|description|logo_url\nEx: Sport Premium|#EXTM3U...|Sport|Chaînes sportives|https://...',
  xtream:
    'titre|url_serveur|utilisateur|mot_de_passe|date_expiration|catégorie\nEx: Abonnement Famille|http://srv.com|user1|pass1|2025-12-31|IPTV',
  'mac-portal':
    'titre|url_portail|adresse_mac|identifiant_mac|catégorie|logo_url\nEx: Portail Intl|http://portal.com/c|AA:BB:CC:DD:EE:FF|MAC001|IPTV|https://...',
};

function parseLine(line: string, type: ContentType): ParsedEntry {
  const trimmed = line.trim();
  const errors: string[] = [];
  const columns = COLUMNS[type];
  const parts = trimmed.split('|').map((p) => p.trim());

  const data: Record<string, string | boolean> = { isActive: true };

  columns.forEach((col, index) => {
    const value = parts[index] || '';
    data[col.key] = value;

    if (col.required && !value) {
      errors.push(`${col.label} manquant`);
    }
  });

  return {
    raw: trimmed,
    valid: errors.length === 0,
    errors,
    data,
    selected: errors.length === 0,
  };
}

export default function BulkImport({ activeTab, onImportComplete }: BulkImportProps) {
  const [rawText, setRawText] = useState('');
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([]);
  const [step, setStep] = useState<'input' | 'preview' | 'importing' | 'done'>('input');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<{
    successCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);

  const columns = COLUMNS[activeTab];

  const handleParse = useCallback(() => {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const entries = lines.map((line) => parseLine(line, activeTab));
    setParsedEntries(entries);
    setStep('preview');
  }, [rawText, activeTab]);

  const toggleEntry = (index: number) => {
    setParsedEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, selected: !entry.selected } : entry,
      ),
    );
  };

  const toggleAll = () => {
    const allSelected = parsedEntries.filter((e) => e.selected).length === parsedEntries.length;
    setParsedEntries((prev) =>
      prev.map((entry) => ({
        ...entry,
        selected: !allSelected && entry.valid,
      })),
    );
  };

  const selectedEntries = useMemo(
    () => parsedEntries.filter((e) => e.selected),
    [parsedEntries],
  );

  const handleImport = async () => {
    const items = selectedEntries.map((e) => e.data);
    setStep('importing');
    setProgress({ current: 0, total: items.length });

    try {
      // Send in batches of 20 for progress tracking
      const BATCH_SIZE = 20;
      let totalSuccess = 0;
      let totalErrors = 0;
      const errorMessages: string[] = [];

      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);

        const response = await fetch(`/api/admin/${activeTab}/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: batch }),
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
                  `Ligne ${i + idx + 1}: ${r.error || 'Erreur inconnue'}`,
                );
              }
            },
          );
        } else if (!response.ok) {
          totalErrors += batch.length;
          errorMessages.push(data.error || 'Erreur serveur');
        }

        setProgress({ current: Math.min(i + BATCH_SIZE, items.length), total: items.length });
      }

      setImportResult({
        successCount: totalSuccess,
        errorCount: totalErrors,
        errors: errorMessages,
      });
      setStep('done');
      onImportComplete();
    } catch {
      setImportResult({
        successCount: 0,
        errorCount: items.length,
        errors: ["Erreur réseau — vérifiez votre connexion et réessayez."],
      });
      setStep('done');
    }
  };

  const handleReset = () => {
    setRawText('');
    setParsedEntries([]);
    setStep('input');
    setImportResult(null);
    setProgress({ current: 0, total: 0 });
  };

  // ─── Step: Input ───
  if (step === 'input') {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">📦 Import en masse</h2>
          <p className="mt-1 text-sm text-slate-400">
            Collez vos entrées ci-dessous, une par ligne. Utilisez le caractère
            <code className="mx-1 rounded bg-slate-700 px-1.5 py-0.5 text-cyan-300">|</code>
            comme séparateur de champs.
          </p>
        </div>

        <div className="mb-4 rounded-lg border border-slate-600 bg-slate-900/60 p-3">
          <p className="mb-1 text-xs font-semibold text-slate-300">Format attendu :</p>
          <code className="text-xs text-cyan-300">{FORMAT_HINTS[activeTab]}</code>
        </div>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={FORMAT_HINTS[activeTab]}
          rows={10}
          className="mb-4 w-full rounded-lg border border-slate-600 bg-slate-900/60 px-4 py-3 font-mono text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500"
        />

        <div className="flex gap-3">
          <button
            onClick={handleParse}
            disabled={!rawText.trim()}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-800/50"
          >
            Analyser les entrées
          </button>
          {rawText.trim() && (
            <span className="flex items-center text-sm text-slate-400">
              {rawText.split('\n').filter((l) => l.trim()).length} ligne(s) détectée(s)
            </span>
          )}
        </div>
      </div>
    );
  }

  // ─── Step: Preview ───
  if (step === 'preview') {
    const validCount = parsedEntries.filter((e) => e.valid).length;
    const invalidCount = parsedEntries.filter((e) => !e.valid).length;

    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">📋 Aperçu de l'import</h2>
            <p className="mt-1 text-sm text-slate-400">
              Vérifiez les entrées ci-dessous. Décochez celles que vous ne souhaitez pas publier.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-400"
          >
            Retour
          </button>
        </div>

        {/* Stats */}
        <div className="mb-4 flex gap-4">
          <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-4 py-2">
            <span className="text-sm text-emerald-300">{validCount} valide(s)</span>
          </div>
          {invalidCount > 0 && (
            <div className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-2">
              <span className="text-sm text-red-300">{invalidCount} erreur(s)</span>
            </div>
          )}
          <div className="rounded-lg border border-blue-600/40 bg-blue-500/10 px-4 py-2">
            <span className="text-sm text-blue-300">{selectedEntries.length} sélectionnée(s)</span>
          </div>
        </div>

        {/* Table */}
        <div className="mb-4 overflow-x-auto rounded-lg border border-slate-600">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-600 bg-slate-900/60">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={
                      parsedEntries.length > 0 &&
                      parsedEntries.filter((e) => e.selected).length === parsedEntries.length
                    }
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-800"
                  />
                </th>
                <th className="px-3 py-3 text-xs font-semibold text-slate-300">#</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-3 text-xs font-semibold text-slate-300"
                  >
                    {col.label}
                    {col.required && <span className="ml-1 text-red-400">*</span>}
                  </th>
                ))}
                <th className="px-3 py-3 text-xs font-semibold text-slate-300">Statut</th>
              </tr>
            </thead>
            <tbody>
              {parsedEntries.map((entry, index) => (
                <tr
                  key={index}
                  className={`border-b border-slate-700/50 ${
                    entry.selected ? 'bg-slate-800/30' : 'bg-slate-900/40 opacity-60'
                  }`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={entry.selected}
                      onChange={() => toggleEntry(index)}
                      disabled={!entry.valid}
                      className="h-4 w-4 rounded border-slate-500 bg-slate-800"
                    />
                  </td>
                  <td className="px-3 py-2 text-slate-400">{index + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="max-w-[200px] truncate px-3 py-2 text-slate-200">
                      {String(entry.data[col.key] || '')}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    {entry.valid ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                        OK
                      </span>
                    ) : (
                      <span
                        className="cursor-help rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300"
                        title={entry.errors.join(', ')}
                      >
                        Erreur
                      </span>
                    )}
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
            className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-800/50"
          >
            🚀 Publier {selectedEntries.length} entrée(s)
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg border border-slate-600 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-400"
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
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white" />
          <h2 className="text-xl font-bold text-white">Import en cours...</h2>
          <p className="mt-1 text-sm text-slate-400">
            {progress.current} / {progress.total} entrées traitées
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-4 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-center text-sm text-slate-400">{percent}%</p>
      </div>
    );
  }

  // ─── Step: Done ───
  if (step === 'done' && importResult) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 text-5xl">
            {importResult.errorCount === 0 ? '✅' : '⚠️'}
          </div>
          <h2 className="text-xl font-bold text-white">Import terminé</h2>
        </div>

        {/* Summary */}
        <div className="mb-6 flex justify-center gap-6">
          <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-6 py-4 text-center">
            <p className="text-3xl font-bold text-emerald-300">{importResult.successCount}</p>
            <p className="mt-1 text-sm text-emerald-200">Réussite(s)</p>
          </div>
          <div className="rounded-lg border border-red-600/40 bg-red-500/10 px-6 py-4 text-center">
            <p className="text-3xl font-bold text-red-300">{importResult.errorCount}</p>
            <p className="mt-1 text-sm text-red-200">Erreur(s)</p>
          </div>
        </div>

        {/* Error details */}
        {importResult.errors.length > 0 && (
          <div className="mb-6 max-h-40 overflow-y-auto rounded-lg border border-red-600/40 bg-red-500/5 p-3">
            <p className="mb-2 text-xs font-semibold text-red-300">Détails des erreurs :</p>
            <ul className="space-y-1">
              {importResult.errors.map((err, i) => (
                <li key={i} className="text-xs text-red-200">
                  • {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button
            onClick={handleReset}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Nouvel import
          </button>
          <button
            onClick={() => {
              setRawText('');
              setParsedEntries([]);
              setStep('input');
              setImportResult(null);
            }}
            className="rounded-lg border border-slate-600 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-400"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return null;
}
