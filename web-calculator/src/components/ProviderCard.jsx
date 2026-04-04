import React from 'react';
import './ProviderCard.css';

function ProviderCard({ cost, isCurrent, isCheapest, isBestValue, currentCost }) {
  const savings = currentCost - cost.monthlyCost;
  const savingsPercent = currentCost > 0 ? ((savings / currentCost) * 100).toFixed(0) : 0;

  return (
    <div className={`provider-card ${isCurrent ? 'current' : ''} ${isCheapest ? 'cheapest' : ''}`}>
      {/* Badges */}
      <div className="card-badges">
        {isCurrent && <span className="badge badge-current">Current</span>}
        {isCheapest && <span className="badge badge-cheapest">💸 Cheapest</span>}
        {isBestValue && !isCheapest && <span className="badge badge-value">⭐ Best Value</span>}
      </div>

      {/* Header */}
      <div className="card-header">
        <div>
          <div className="card-provider" style={{ color: cost.color }}>
            {cost.provider}
          </div>
          <div className="card-model">{cost.name}</div>
        </div>
        <div className="card-tier">{cost.tier}</div>
      </div>

      {/* Cost */}
      <div className="card-cost">
        <span className="cost-amount">${cost.monthlyCost.toFixed(2)}</span>
        <span className="cost-period">/month</span>
      </div>

      {/* Quality */}
      <div className="card-quality">
        <div className="quality-label">
          <span>Quality</span>
          <span>{cost.qualityScore}/100</span>
        </div>
        <div className="quality-bar-bg">
          <div
            className="quality-bar-fill"
            style={{
              width: `${cost.qualityScore}%`,
              background: cost.qualityScore >= 90
                ? 'var(--accent-green)'
                : cost.qualityScore >= 75
                  ? 'var(--accent-blue)'
                  : 'var(--accent-orange)',
            }}
          />
        </div>
      </div>

      {/* Savings */}
      {!isCurrent && savings > 0 && (
        <div className="card-savings">
          Save ${savings.toFixed(2)}/mo ({savingsPercent}%)
        </div>
      )}

      {/* Pricing Details */}
      <div className="card-pricing">
        <div className="pricing-row">
          <span>Input</span>
          <span>${cost.inputCost.toFixed(4)}</span>
        </div>
        <div className="pricing-row">
          <span>Output</span>
          <span>${cost.outputCost.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}

export default ProviderCard;
