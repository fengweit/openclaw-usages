import React, { useEffect, useState } from 'react';
import { fetchUsageData, refreshData, fmtCost, fmtTokens, fmtPct } from '../lib/api';
import SummaryCards from '../components/SummaryCards';
import CostChart from '../components/CostChart';
import ModelBreakdown from '../components/ModelBreakdown';
import SessionTable from '../components/SessionTable';
import TopMessages from '../components/TopMessages';
import Heatmap from '../components/Heatmap';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const d = await fetchUsageData();
      setData(d);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshData();
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="loader" />
        <p>Parsing session data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-error">
        <h2>⚠️ Connection Error</h2>
        <p>{error}</p>
        <p className="hint">Make sure the API server is running: <code>npm run dev:api</code></p>
        <button onClick={loadData}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-header-left">
          <h1>⚡ OpenClaw Usage Analyzer</h1>
          <span className="dash-period">
            {data.summary.firstDate} → {data.summary.lastDate}
          </span>
        </div>
        <div className="dash-header-right">
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? '↻ Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </header>

      <SummaryCards summary={data.summary} />

      <nav className="dash-tabs">
        {['overview', 'sessions', 'messages', 'heatmap'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'sessions' && '📋 Sessions'}
            {tab === 'messages' && '💬 Top Messages'}
            {tab === 'heatmap' && '🔥 Activity'}
          </button>
        ))}
      </nav>

      <main className="dash-main">
        {activeTab === 'overview' && (
          <div className="dash-grid">
            <div className="chart-section full-width">
              <h2>Daily Spending</h2>
              <CostChart dailyCosts={data.dailyCosts} />
            </div>
            <div className="chart-section">
              <h2>Cost by Model</h2>
              <ModelBreakdown models={data.models} totalCost={data.summary.totalCost} />
            </div>
            <div className="chart-section">
              <h2>What-If Analysis</h2>
              <WhatIfCard models={data.models} totalCost={data.summary.totalCost} />
            </div>
          </div>
        )}
        {activeTab === 'sessions' && (
          <SessionTable sessions={data.sessions} />
        )}
        {activeTab === 'messages' && (
          <TopMessages messages={data.topMessages} />
        )}
        {activeTab === 'heatmap' && (
          <Heatmap data={data.heatmap} />
        )}
      </main>
    </div>
  );
}

function WhatIfCard({ models, totalCost }) {
  // Calculate what costs would be if all Opus usage was on Sonnet
  const opusModel = models.find(m => m.model?.includes('opus'));
  if (!opusModel) return <p className="muted">Not enough data for analysis</p>;

  // Opus pricing: $5/$25 per MTok input/output, $0.50 cache read
  // Sonnet pricing: $3/$15 per MTok input/output, $0.30 cache read  
  // Haiku pricing: $0.80/$4 per MTok input/output, $0.08 cache read
  const opusCost = opusModel.cost;
  const sonnetEstimate = opusCost * (3/5 + 15/25) / 2; // rough ratio
  const haikuEstimate = opusCost * (0.80/5 + 4/25) / 2;
  const savings_sonnet = opusCost - sonnetEstimate;
  const savings_haiku = opusCost - haikuEstimate;

  return (
    <div className="whatif-card">
      <p className="whatif-current">
        Current Opus spend: <strong>{fmtCost(opusCost)}</strong>
      </p>
      <div className="whatif-scenarios">
        <div className="scenario">
          <div className="scenario-label">If all Sonnet 4.5</div>
          <div className="scenario-cost">{fmtCost(sonnetEstimate)}</div>
          <div className="scenario-savings green">Save {fmtCost(savings_sonnet)}</div>
        </div>
        <div className="scenario">
          <div className="scenario-label">If all Haiku 4.5</div>
          <div className="scenario-cost">{fmtCost(haikuEstimate)}</div>
          <div className="scenario-savings green">Save {fmtCost(savings_haiku)}</div>
        </div>
        <div className="scenario highlight">
          <div className="scenario-label">Smart routing (est.)</div>
          <div className="scenario-cost">{fmtCost(opusCost * 0.35)}</div>
          <div className="scenario-savings green">Save {fmtCost(opusCost * 0.65)} (65%)</div>
        </div>
      </div>
      <p className="whatif-note">
        Smart routing sends simple queries to Haiku, medium to Sonnet, complex to Opus — coming soon.
      </p>
    </div>
  );
}

export default Dashboard;
