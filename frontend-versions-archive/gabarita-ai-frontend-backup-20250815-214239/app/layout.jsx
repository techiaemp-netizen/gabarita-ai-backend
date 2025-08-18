"use client";

import '../styles/globals.css';
import { AuthProvider } from '../utils/auth';
import Header from '../components/Header';
import NavDrawer from '../components/NavDrawer';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Root layout
 *
 * This component wraps all pages in the application. It provides
 * authentication context, header and navigation drawer to pages
 * except for the login page. Client-side hooks are used to toggle
 * drawer visibility and inspect the current route.
 */
export default function RootLayout({ children }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  // Hide header and drawer on the login page
  const showNavigation = pathname !== '/login';

  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {showNavigation && (
            <>
              <Header onMenuToggle={() => setNavOpen((v) => !v)} />
              <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
            </>
          )}
          <main className="flex-1 min-h-screen flex flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
