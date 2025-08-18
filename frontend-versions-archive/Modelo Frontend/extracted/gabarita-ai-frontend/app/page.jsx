"use client";

import { useAuth } from '../utils/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root page
 *
 * Redirects the user to the dashboard or login page depending on
 * authentication status. Displays a simple loading indicator while
 * waiting for the auth state to resolve.
 */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.push(user ? '/painel' : '/login');
    }
  }, [user, loading, router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-gray-600">Carregando...</p>
    </div>
  );
}
