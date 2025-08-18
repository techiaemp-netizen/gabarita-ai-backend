"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import com SSR desabilitado para resolver erro useSearchParams no Vercel
const PlanosContent = dynamic(() => import('./PlanosContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando planos...</p>
      </div>
    </div>
  )
});

/**
 * Planos page with Vercel-compatible useSearchParams implementation
 */
export default function PlanosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    }>
      <PlanosContent />
    </Suspense>
  );
}