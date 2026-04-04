import React from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import Calculator from '../components/Calculator';
import Results from '../components/Results';
import { calculateAllCosts, getRecommendation } from '../lib/calculator';
import './Dashboard.css';

function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [inputs, setInputs] = React.useState({
    messagesPerDay: 50,
    messageLength: 'medium',
    useCase: 'coding',
    currentProvider: 'claude-sonnet',
  });

  const results = React.useMemo(() => {
    const tokensMap = { short: 500, medium: 2000, long: 5000 };
    const tokensPerMessage = tokensMap[inputs.messageLength] || 2000;
    const monthlyMessages = inputs.messagesPerDay * 30;
    const monthlyTokens = monthlyMessages * tokensPerMessage;
    const monthlyInput = Math.round(monthlyTokens * 0.4);
    const monthlyOutput = Math.round(monthlyTokens * 0.6);

    const costs = calculateAllCosts({ monthlyInput, monthlyOutput }, inputs.useCase);
    const recommendation = getRecommendation(costs, inputs.currentProvider);

    return { costs, recommendation, monthlyTokens, monthlyInput, monthlyOutput, monthlyMessages };
  }, [inputs]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-header-left">
          <h1>⚡ Usage Analyzer</h1>
        </div>
        <div className="dash-header-right">
          <div className="user-info">
            <span className="user-email">{user?.email}</span>
            <span className="user-plan">Free</span>
          </div>
          <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>

      <div className="dash-banner">
        <div className="banner-content">
          <span className="banner-icon">🚀</span>
          <div>
            <strong>Smart Routing coming soon</strong> — auto-switch models to save 40-60% on every session.
            We'll email you when it's live.
          </div>
        </div>
      </div>

      <main className="dash-main">
        <div className="dash-grid">
          <Calculator inputs={inputs} onChange={setInputs} />
          <Results results={results} currentProvider={inputs.currentProvider} />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
