'use client';

import { usePathname } from 'next/navigation';

/**
 * ExoClickVerification — Injects the ExoClick site verification meta tag
 * on all pages except admin routes.
 */
export default function ExoClickVerification() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <meta 
      name="6a97888e-site-verification" 
      content="1936a5119a98cfa2bbbb600d262ec003" 
    />
  );
}
