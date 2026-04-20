"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useSearch } from '@/app/context/SearchContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'Playlists M3U', href: '/#m3u' },
    { name: 'Xtream', href: '/#xtream' },
    { name: 'Mac Portal', href: '/#mac-portal' },
    { name: 'Applications', href: '/#apps' },
    { name: 'À propos', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png?v=3" alt="Ngori" className="h-[40px] w-auto transition-transform group-hover:scale-105" />
          <span className="hidden sm:block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-success">
            Ngori
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-foreground-secondary"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-muted" />
            <input
              type="search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (pathname !== '/' && e.target.value.length > 0) {
                  router.push('/#content-zone');
                }
              }}
              className="linear-input pl-9 w-48 lg:w-64 h-9"
            />
          </div>
          
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-surface text-foreground-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          <Link href="/admin/login" className="hidden md:flex linear-btn linear-btn-primary h-9">
            Connexion
          </Link>

          {/* MOBILE TOGGLE */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background absolute w-full animate-fade-in pb-4">
          <div className="container px-4 py-4 flex flex-col gap-4">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-muted" />
              <input
                type="search"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (pathname !== '/' && e.target.value.length > 0) {
                    router.push('/#content-zone');
                  }
                }}
                className="linear-input pl-9 w-full h-10"
              />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-base font-medium py-2 border-b border-border/20",
                  pathname === link.href ? "text-primary" : "text-foreground-secondary"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              href="/admin/login" 
              className="linear-btn linear-btn-primary mt-2 flex justify-center py-2"
              onClick={() => setIsOpen(false)}
            >
              Connexion
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
