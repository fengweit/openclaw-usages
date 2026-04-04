import React from 'react';
import './CostChart.css';

function CostChart({ costs, currentProvider }) {
  const maxCost = Math.max(...costs.map((c) => c.monthlyCost));

  return (
    <div className="cost-chart">
      {costs.map((cost) => {
        const width = maxCost > 0 ? (cost.monthlyCost / maxCost) * 100 : 0;
        const isCurrent = cost.key === currentProvider;

        return (
          <div key={cost.key} className={`chart-row ${isCurrent ? 'current' : ''}`}>
            <div className="chart-label">
              <span className="chart-model">{cost.name}</span>
              <span className="chart-provider" style={{ color: cost.color }}>
                {cost.provider}
              </span>
            </div>
            <div className="chart-bar-container">
              <div
                className="chart-bar"
                style={{
                  width: `${Math.max(width, 1)}%`,
                  background: isCurrent
                    ? 'var(--accent-orange)'
                    : cost.tier === 'premium'
                      ? 'var(--accent-red)'
                      : cost.tier === 'standard'
                        ? 'var(--accent-blue)'
                        : cost.tier === 'budget'
                          ? 'var(--accent-green)'
                          : '#6b7280',
                }}
              />
              <span className="chart-value">${cost.monthlyCost.toFixed(2)}</span>
            </div>
          </div>
        );
      })}

      <div className="chart-legend">
        <span><span className="legend-dot" style={{ background: 'var(--accent-red)' }} /> Premium</span>
        <span><span className="legend-dot" style={{ background: 'var(--accent-blue)' }} /> Standard</span>
        <span><span className="legend-dot" style={{ background: 'var(--accent-green)' }} /> Budget</span>
        <span><span className="legend-dot" style={{ background: 'var(--accent-orange)' }} /> Current</span>
      </div>
    </div>
  );
}

export default CostChart;
