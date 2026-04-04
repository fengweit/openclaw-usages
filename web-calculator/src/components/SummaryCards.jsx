import React from 'react';
import { fmtCost, fmtTokens, fmtPct } from '../lib/api';
import './SummaryCards.css';

function SummaryCards({ summary }) {
  const cards = [
    {
      icon: '💰',
      label: 'Total Spend',
      value: fmtCost(summary.totalCost),
      sub: `${fmtCost(summary.avgCostPerDay)}/day avg`,
      color: 'red',
    },
    {
      icon: '💬',
      label: 'Messages',
      value: summary.totalMessages.toLocaleString(),
      sub: `${fmtCost(summary.avgCostPerMessage)} avg/msg`,
      color: 'blue',
    },
    {
      icon: '📊',
      label: 'Sessions',
      value: summary.totalSessions.toString(),
      sub: `${fmtCost(summary.avgCostPerSession)} avg/session`,
      color: 'purple',
    },
    {
      icon: '🗄️',
      label: 'Cache Hit Rate',
      value: fmtPct(summary.cacheHitRate),
      sub: `${fmtTokens(summary.totalCacheRead)} tokens cached`,
      color: 'green',
    },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, i) => (
        <div key={i} className={`summary-card ${card.color}`}>
          <div className="card-icon">{card.icon}</div>
          <div className="card-content">
            <div className="card-label">{card.label}</div>
            <div className="card-value">{card.value}</div>
            <div className="card-sub">{card.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
