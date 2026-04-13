'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Connexion impossible.');
      }

      router.push('/admin/dashboard');
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Connexion impossible.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800/50 p-8 backdrop-blur">
        <h1 className="mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-center text-3xl font-bold text-transparent">
          Ngori Admin
        </h1>
        <p className="mb-6 text-center text-sm text-slate-400">
          Connectez-vous pour gerer vos contenus.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-slate-300">Mot de passe admin</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder="Saisissez votre mot de passe"
              required
            />
          </label>

          {error && (
            <div className="rounded border border-red-500 bg-red-500/20 px-4 py-2 text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-800"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Retour a{' '}
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
