"use client";

import Button from '../../components/ui/Button';
import { useAuth } from '../../utils/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Login page
 *
 * Presents a full-screen gradient background with a centred login
 * card. The user can sign in via Google. If already signed in, the
 * user is redirected to the dashboard automatically.
 */
export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/painel');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/60 to-background">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-md text-center space-y-4 max-w-sm w-full">
        <h1 className="text-2xl font-medium">Bem‑vindo ao Gabarita.AI</h1>
        <p className="text-sm text-gray-700">Faça login com sua conta Google para começar.</p>
        <Button onClick={signIn}>Entrar com Google</Button>
      </div>
    </div>
  );
}
