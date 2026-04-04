import React from 'react';
import { fmtCost, fmtTokens, fmtPct } from '../lib/api';
import './ModelBreakdown.css';

const MODEL_COLORS = {
  'claude-opus-4-6': '#8b5cf6',
  'claude-opus-4-5': '#a78bfa',
  'claude-sonnet-4-5': '#3b82f6',
  'claude-haiku-4-5': '#10b981',
  'delivery-mirror': '#6b7280',
};

function ModelBreakdown({ models, totalCost }) {
  return (
    <div className="model-breakdown">
      {models.filter(m => m.cost > 0).map((model, i) => {
        const pct = totalCost > 0 ? model.cost / totalCost : 0;
        const color = MODEL_COLORS[model.model] || '#6b7280';

        return (
          <div key={model.model} className="model-row">
            <div className="model-info">
              <div className="model-dot" style={{ background: color }} />
              <div className="model-name">{model.model}</div>
              <div className="model-sessions">{model.sessions} sessions</div>
            </div>
            <div className="model-bar-wrap">
              <div
                className="model-bar"
                style={{ width: `${pct * 100}%`, background: color }}
              />
            </div>
            <div className="model-stats">
              <span className="model-cost">{fmtCost(model.cost)}</span>
              <span className="model-pct">{fmtPct(pct)}</span>
            </div>
            <div className="model-tokens">
              <span>{fmtTokens(model.outputTokens)} out</span>
              <span className="sep">·</span>
              <span>{fmtTokens(model.cacheRead)} cached</span>
              <span className="sep">·</span>
              <span>{model.messages} msgs</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ModelBreakdown;
