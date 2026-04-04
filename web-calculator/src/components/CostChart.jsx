import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { fmtCost } from '../lib/api';
import './CostChart.css';

function CostChart({ dailyCosts }) {
  const data = dailyCosts.map(d => ({
    date: d.date.slice(5), // MM-DD
    cost: parseFloat(d.cost.toFixed(2)),
    fullDate: d.date,
  }));

  return (
    <div className="cost-chart">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="chart-tooltip">
                  <div className="tooltip-date">{d.fullDate}</div>
                  <div className="tooltip-cost">{fmtCost(d.cost)}</div>
                </div>
              );
            }}
          />
          <Bar
            dataKey="cost"
            fill="url(#costGradient)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CostChart;
