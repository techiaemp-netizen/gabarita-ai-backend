"use client";

import { useEffect } from 'react';
import { useAuth } from '../../utils/auth';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Desempenho page
 *
 * Displays line charts for each subject to illustrate progress over
 * time. The data used here is static for demonstration purposes but
 * can be replaced by calls to Firestore or another API. Users must
 * be authenticated to access this page.
 */
export default function DesempenhoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const temas = [
    {
      name: 'Português',
      data: [
        { x: 1, y: 60 },
        { x: 2, y: 70 },
        { x: 3, y: 80 },
        { x: 4, y: 85 },
      ],
    },
    {
      name: 'Raciocínio Lógico',
      data: [
        { x: 1, y: 50 },
        { x: 2, y: 55 },
        { x: 3, y: 65 },
        { x: 4, y: 68 },
      ],
    },
    {
      name: 'Administração',
      data: [
        { x: 1, y: 40 },
        { x: 2, y: 60 },
        { x: 3, y: 75 },
        { x: 4, y: 90 },
      ],
    },
  ];

  return (
    <div className="p-4 space-y-6 flex-1">
      <h2 className="text-xl font-medium">Desempenho por Tema</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {temas.map((tema, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-medium mb-2 text-center">{tema.name}</h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tema.data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <XAxis dataKey="x" tickCount={4} />
                  <YAxis domain={[0, 100]} tickCount={5} />
                  <Tooltip />
                  <Line type="monotone" dataKey="y" stroke="#3E8EFF" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
