'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  name: string;
  stock: number;
}

export default function StockChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(value) => value.length > 8 ? `${value.substring(0, 8)}...` : value}
          interval={0}
        />
        
        <YAxis 
          stroke="#94a3b8" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
        />
        
        <Tooltip 
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            padding: '12px'
          }}
        />
        
        <Bar dataKey="stock" radius={[6, 6, 0, 0]} barSize={40}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.stock < 10 ? '#f43f5e' : '#3b82f6'} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}