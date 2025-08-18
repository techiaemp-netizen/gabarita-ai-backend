"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../utils/auth';
import { useRouter } from 'next/navigation';

/**
 * Ranking page
 *
 * Shows a simple table ranking of the top users. Filters allow
 * selection of a specific job role (cargo) and block. In a fully
 * featured application this data would be loaded from Firestore.
 */
export default function RankingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const allData = [
    { name: 'João', cargo: 'Analista', block: 'A', score: 95 },
    { name: 'Maria', cargo: 'Analista', block: 'B', score: 92 },
    { name: 'Carlos', cargo: 'Técnico', block: 'A', score: 88 },
    { name: 'Ana', cargo: 'Técnico', block: 'B', score: 80 },
  ];
  const cargos = ['Todos', 'Analista', 'Técnico'];
  const blocks = ['Todos', 'A', 'B'];
  const [cargo, setCargo] = useState('Todos');
  const [block, setBlock] = useState('Todos');

  const filtered = allData
    .filter((item) => (cargo === 'Todos' || item.cargo === cargo))
    .filter((item) => (block === 'Todos' || item.block === block))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="p-4 space-y-4 flex-1">
      <h2 className="text-xl font-medium">Ranking Nacional</h2>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="cargo" className="mr-2 text-sm text-gray-700">
            Cargo:
          </label>
          <select
            id="cargo"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            {cargos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="block" className="mr-2 text-sm text-gray-700">
            Bloco:
          </label>
          <select
            id="block"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            {blocks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pos
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bloco
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pontuação
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {filtered.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2 font-medium">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                </td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.cargo}</td>
                <td className="px-4 py-2">{item.block}</td>
                <td className="px-4 py-2">{item.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
