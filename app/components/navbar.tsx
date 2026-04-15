'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { IconMenu, IconX, IconNewspaper, IconMusic, IconRadio, IconMonitor, IconSmartphone } from './icons';

export type ContentView = 'all' | 'playlists' | 'xtreamCodes' | 'macPortals' | 'appItems';

interface NavItem {
  id: ContentView;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'all', label: 'Actualités', icon: <IconNewspaper size={16} /> },
  { id: 'playlists', label: 'M3U', icon: <IconMusic size={16} /> },
  { id: 'xtreamCodes', label: 'Xtream', icon: <IconRadio size={16} /> },
  { id: 'macPortals', label: 'Mac Portal', icon: <IconMonitor size={16} /> },
  { id: 'appItems', label: 'Applications', icon: <IconSmartphone size={16} /> },
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-[#4169E1] text-white shadow-md shadow-[#4169E1]/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#1a1a2e]'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileMenuOpen ? <IconX size={24} /> : <IconMenu size={24} />}
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
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
