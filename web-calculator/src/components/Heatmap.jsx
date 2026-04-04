import React from 'react';
import { fmtCost } from '../lib/api';
import './Heatmap.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function Heatmap({ data }) {
  // Build grid: data is [{dow, hour, cost}]
  const grid = {};
  let maxCost = 0;
  for (const d of data) {
    const key = `${d.dow}-${d.hour}`;
    grid[key] = (grid[key] || 0) + d.cost;
    if (grid[key] > maxCost) maxCost = grid[key];
  }

  function getCellColor(cost) {
    if (!cost || maxCost === 0) return 'rgba(255,255,255,0.03)';
    const intensity = Math.min(cost / maxCost, 1);
    // Purple gradient
    const r = Math.round(139 * intensity);
    const g = Math.round(92 * intensity * 0.3);
    const b = Math.round(246 * intensity);
    return `rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.7})`;
  }

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-card">
        <h2>🔥 Activity Heatmap</h2>
        <p className="heatmap-subtitle">When you spend the most on AI (UTC)</p>

        <div className="heatmap-grid">
          <div className="heatmap-corner" />
          {HOURS.map(h => (
            <div key={h} className="heatmap-hour-label">
              {h % 3 === 0 ? `${h}:00` : ''}
            </div>
          ))}

          {DAYS.map((day, dow) => (
            <React.Fragment key={day}>
              <div className="heatmap-day-label">{day}</div>
              {HOURS.map(hour => {
                const key = `${dow}-${hour}`;
                const cost = grid[key] || 0;
                return (
                  <div
                    key={key}
                    className="heatmap-cell"
                    style={{ background: getCellColor(cost) }}
                    title={`${day} ${hour}:00 — ${fmtCost(cost)}`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-cells">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map(i => (
              <div
                key={i}
                className="legend-cell"
                style={{ background: getCellColor(maxCost * i) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;
