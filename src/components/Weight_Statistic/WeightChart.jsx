import React from 'react';
      import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

      const WeightChart = ({ weightHistory = [] }) => {
        const data = weightHistory.map(record => ({
          date: new Date(record.recorded_at).toLocaleDateString(),
          Вес: record.weight,
        }));

        return (
          <ResponsiveContainer width="200%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Вес" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      };

      export default WeightChart;