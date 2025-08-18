"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../utils/auth';
import { useRouter } from 'next/navigation';
import NewsItem from '../../components/NewsItem';

/**
 * Notícias page
 *
 * Displays a list of recent news items. The example data here is
 * static but could be replaced by calls to a news API or Firestore.
 */
export default function NoticiasPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const [news] = useState([
    {
      title: 'Nova prova da FGV é divulgada',
      source: 'FGV Notícias',
      url: '#',
    },
    {
      title: 'Dicas para estudar Administração Pública',
      source: 'Blog do Concurseiro',
      url: '#',
    },
    {
      title: 'FGV anuncia atualização no edital 2025',
      source: 'Portal Oficial FGV',
      url: '#',
    },
  ]);

  return (
    <div className="p-4 space-y-4 flex-1">
      <h2 className="text-xl font-medium">Últimas Notícias</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((item, idx) => (
          <NewsItem key={idx} {...item} />
        ))}
      </div>
    </div>
  );
}
