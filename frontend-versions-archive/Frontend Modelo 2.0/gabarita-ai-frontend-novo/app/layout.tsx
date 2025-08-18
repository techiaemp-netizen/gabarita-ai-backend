import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gabarita.AI - Simulado Inteligente para o CNU 2025',
  description: 'Plataforma de estudos com IA para o Concurso Nacional Unificado 2025. Simulados personalizados, análise de desempenho e gamificação.',
  keywords: 'CNU 2025, concurso público, simulado, IA, estudos, gamificação',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
