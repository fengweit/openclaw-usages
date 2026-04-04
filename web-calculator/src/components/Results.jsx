import React from 'react';
import ProviderCard from './ProviderCard';
import CostChart from './CostChart';
import { calculateHybridCost } from '../lib/calculator';
import './Results.css';

function Results({ results, currentProvider }) {
  const { costs, recommendation, monthlyTokens, monthlyInput, monthlyOutput } = results;
  const hybrid = calculateHybridCost({ monthlyInput, monthlyOutput });
  const currentCost = recommendation.current ? recommendation.current.monthlyCost : 0;

  return (
    <div className="results">
      {/* Savings Banner */}
      {recommendation.maxSavings > 0 && (
        <div className="savings-banner">
          <div className="savings-amount">
            💰 Save up to <strong>${recommendation.maxSavings.toFixed(2)}/month</strong>
          </div>
          <div className="savings-detail">
            Switch from {recommendation.current?.name} to {recommendation.cheapest.name} — {recommendation.maxSavingsPercent}% reduction
          </div>
        </div>
      )}

      {/* Cost Chart */}
      <div className="section">
        <h2>📊 Cost Comparison</h2>
        <CostChart costs={costs} currentProvider={currentProvider} />
      </div>

      {/* Provider Cards */}
      <div className="section">
        <h2>🏷️ All Providers</h2>
        <div className="provider-grid">
          {costs.map((cost) => (
            <ProviderCard
              key={cost.key}
              cost={cost}
              isCurrent={cost.key === currentProvider}
              isCheapest={cost.key === recommendation.cheapest.key}
              isBestValue={cost.key === recommendation.bestValue.key}
              currentCost={currentCost}
            />
          ))}
        </div>
      </div>

      {/* Hybrid Routing */}
      <div className="section hybrid-section">
        <h2>🔀 Hybrid Routing Preview</h2>
        <div className="hybrid-card">
          <div className="hybrid-header">
            <span className="hybrid-badge">PRO FEATURE</span>
            <span className="hybrid-cost">${hybrid.monthlyCost.toFixed(2)}/mo</span>
          </div>
          <p className="hybrid-desc">
            Smart routing sends 70% of simple queries to <strong>{hybrid.budgetModel}</strong> and
            30% of complex queries to <strong>{hybrid.premiumModel}</strong>.
          </p>
          <div className="hybrid-stats">
            <div className="hybrid-stat">
              <span className="stat-label">Quality Score</span>
              <span className="stat-value">{hybrid.qualityScore}/100</span>
            </div>
            <div className="hybrid-stat">
              <span className="stat-label">vs Current</span>
              <span className="stat-value savings">
                {currentCost > hybrid.monthlyCost
                  ? `-$${(currentCost - hybrid.monthlyCost).toFixed(2)}`
                  : `+$${(hybrid.monthlyCost - currentCost).toFixed(2)}`}
              </span>
            </div>
          </div>
          <a href="https://www.npmjs.com/package/openclaw-usage" className="hybrid-cta" target="_blank" rel="noopener">
            Get CLI Tool → <code>npm i -g openclaw-usage</code>
          </a>
        </div>
      </div>

      {/* Premium Report Upsell */}
      <div className="section upsell-section">
        <div className="upsell-card">
          <h3>📋 Want a detailed report?</h3>
          <p>
            Get a personalized PDF report with optimization recommendations,
            migration steps, and projected savings over 12 months.
          </p>
          <button className="upsell-btn">Get Premium Report — $9</button>
        </div>
      </div>
    </div>
  );
}

export default Results;
