"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3E8EFF', '#F5A623', '#F2711C', '#6FCF97'];

/**
 * CardDesempenho component
 *
 * Displays a pie chart showing the proportion of correct versus
 * incorrect answers for a given subject. The `data` prop should be an
 * array of objects with `name` and `value` fields.
 */
export default function CardDesempenho({ title, data }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center">
      <h3 className="text-sm font-medium mb-4 text-center">{title}</h3>
      <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
