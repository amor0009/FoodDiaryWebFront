import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeightChart = ({ weightHistory = [] }) => {
  const data = weightHistory
    .filter(record => record.created_at && record.weight != null)
    .map(record => {
      const date = new Date(record.created_at);
      const isValid = !isNaN(date.getTime());
      return {
        timestamp: isValid ? date.getTime() : 0,
        date: isValid
          ? date.toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '—',
        Вес: record.weight,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  if (data.length === 0) {
    return <div className="empty-text">Нет данных для графика</div>;
  }

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
          domain={[0, 'auto']}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => [`${value} кг`, 'Вес']}
          labelFormatter={(label) => `Дата: ${label}`}
          labelStyle={{ color: '#8884d8' }}
          itemStyle={{ color: '#8884d8' }}
          contentStyle={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #ddd',
            padding: '8px 12px',
          }}
        />
        <Legend />
        <Bar dataKey="Вес" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeightChart;