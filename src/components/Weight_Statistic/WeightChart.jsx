import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeightChart = ({ weightHistory = [] }) => {
  const data = weightHistory.map(record => ({
    date: new Date(record.created_at).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    Вес: record.weight,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          angle={-45} 
          textAnchor="end" 
          height={70} 
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          domain={[0, 'auto']}  // ось Y начинается с 0
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [`${value} кг`, 'Вес']}
          labelFormatter={(label) => `Дата: ${label}`}
        />
        <Legend />
        <Bar dataKey="Вес" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeightChart;