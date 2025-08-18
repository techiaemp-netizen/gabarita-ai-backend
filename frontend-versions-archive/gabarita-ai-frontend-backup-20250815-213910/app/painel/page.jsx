"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../utils/auth';
import { useRouter } from 'next/navigation';
import ProgressBar from '../../components/ProgressBar';
import CardDesempenho from '../../components/CardDesempenho';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Painel (dashboard) page
 *
 * Shows the user's life bar, performance cards for each subject and
 * statistics for the current day using a bar chart. When the user is
 * not authenticated they are redirected back to the login page.
 */
export default function PainelPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [life, setLife] = useState(80);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Static performance data. In a real app this would come from
  // Firestore via a helper in utils/firestore.js.
  const performanceData = [
    { name: 'Português', acertos: 75 },
    { name: 'Raciocínio Lógico', acertos: 60 },
    { name: 'Administração', acertos: 90 },
    { name: 'Direito', acertos: 50 },
  ];

  return (
    <div className="p-4 flex flex-col space-y-6 flex-1">
      <div>
          <h2 className="text-xl font-medium mb-2">Sua Jornada</h2>
          <ProgressBar value={life} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceData.map((item, idx) => (
          <CardDesempenho
            key={idx}
            title={item.name}
            data={[{ name: 'Acertos', value: item.acertos }, { name: 'Erros', value: 100 - item.acertos }]}
          />
        ))}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Estatísticas de Hoje</h3>
        <div className="w-full h-60 bg-white rounded-xl shadow-sm p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: 'Acertos', value: 20 }, { name: 'Erros', value: 5 }]}> 
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3E8EFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
