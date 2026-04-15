'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export type ContentView = 'all' | 'playlists' | 'xtreamCodes' | 'macPortals' | 'appItems';

interface NavItem {
  id: ContentView;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'all', label: 'Actualités', icon: '📰' },
  { id: 'playlists', label: 'M3U', icon: '🎵' },
  { id: 'xtreamCodes', label: 'Xtream', icon: '📡' },
  { id: 'macPortals', label: 'Mac Portal', icon: '🖥️' },
  { id: 'appItems', label: 'Applications', icon: '📱' },
];

interface NavbarProps {
  activeView: ContentView;
  onViewChange: (view: ContentView) => void;
}

export default function Navbar({ activeView, onViewChange }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const goToView = useCallback((view: ContentView) => {
    onViewChange(view);
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById('content-zone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, [onViewChange]);

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

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-[#4169E1] flex items-center justify-center shadow-md shadow-[#4169E1]/20 group-hover:shadow-lg group-hover:shadow-[#4169E1]/30 transition-shadow">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold text-[#1a1a2e] tracking-tight">Ngori</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => goToView(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-[#4169E1] text-white shadow-md shadow-[#4169E1]/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#1a1a2e]'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
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
        <nav className="px-4 pb-4 pt-2 space-y-1 border-t border-slate-200/60 bg-white/95 backdrop-blur-xl">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => goToView(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeView === item.id
                  ? 'bg-[#4169E1] text-white shadow-md shadow-[#4169E1]/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#1a1a2e]'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
