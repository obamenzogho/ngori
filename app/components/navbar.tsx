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
  { id: 'all', label: 'Actualités', icon: <IconNewspaper size={15} /> },
  { id: 'playlists', label: 'M3U', icon: <IconMusic size={15} /> },
  { id: 'xtreamCodes', label: 'Xtream', icon: <IconRadio size={15} /> },
  { id: 'macPortals', label: 'Mac Portal', icon: <IconMonitor size={15} /> },
  { id: 'appItems', label: 'Apps', icon: <IconSmartphone size={15} /> },
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
    <header className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png?v=3" alt="Ngori" className="h-14 w-auto transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => goToView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
                  activeView === item.id
                    ? 'bg-white/[0.08] text-white'
                    : 'text-[#8B8B9E] hover:text-[#E8E8ED] hover:bg-white/[0.04]'
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
            className="md:hidden p-2 -mr-2 rounded-md hover:bg-white/[0.04] transition-colors text-[#8B8B9E]"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileMenuOpen ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        ref={menuRef}
        className={`md:hidden overflow-hidden transition-all duration-200 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-4 pb-4 pt-2 space-y-0.5 border-t border-white/[0.06] bg-[#0A0A0F]/95 backdrop-blur-xl">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => goToView(item.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                activeView === item.id
                  ? 'bg-white/[0.08] text-white'
                  : 'text-[#8B8B9E] hover:text-[#E8E8ED] hover:bg-white/[0.04]'
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
