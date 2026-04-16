'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show header on login page
  if (pathname === '/admin/login') {
    return null;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    router.push('/');
  };

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', active: pathname === '/admin/dashboard' },
    { href: '/admin/analytics', label: 'Analytics', active: pathname === '/admin/analytics' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="h-7 w-7 rounded-md bg-[#5E6AD2] flex items-center justify-center ngori-glow">
            <span className="text-white font-bold text-[10px]">N</span>
          </div>
          <span className="text-sm font-semibold text-[#E8E8ED] tracking-tight">Ngori Admin</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
                link.active
                  ? 'bg-white/[0.08] text-white'
                  : 'text-[#8B8B9E] hover:text-[#E8E8ED] hover:bg-white/[0.04]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-2 h-4 w-px bg-white/[0.06]" />
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#8B8B9E] transition hover:text-red-400 hover:bg-red-500/10"
          >
            Déconnexion
          </button>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-[#8B8B9E] hover:bg-white/[0.04] hover:text-[#E8E8ED] md:hidden"
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <nav className="border-t border-white/[0.06] bg-[#0A0A0F] md:hidden">
          <div className="space-y-0.5 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-md px-3 py-2.5 text-[13px] font-medium transition ${
                  link.active
                    ? 'bg-white/[0.08] text-white'
                    : 'text-[#8B8B9E] hover:text-[#E8E8ED] hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full rounded-md px-3 py-2.5 text-left text-[13px] font-medium text-[#8B8B9E] transition hover:text-red-400 hover:bg-red-500/10"
            >
              Déconnexion
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
