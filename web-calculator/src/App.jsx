import React, { useState, useMemo } from 'react';
import Calculator from './components/Calculator';
import Results from './components/Results';
import { calculateAllCosts, getRecommendation } from './lib/calculator';

function App() {
  const [inputs, setInputs] = useState({
    messagesPerDay: 50,
    messageLength: 'medium',
    useCase: 'coding',
    currentProvider: 'claude-sonnet',
  });

  const results = useMemo(() => {
    const tokensMap = { short: 500, medium: 2000, long: 5000 };
    const tokensPerMessage = tokensMap[inputs.messageLength] || 2000;
    const monthlyMessages = inputs.messagesPerDay * 30;
    const monthlyTokens = monthlyMessages * tokensPerMessage;
    const monthlyInput = Math.round(monthlyTokens * 0.4);
    const monthlyOutput = Math.round(monthlyTokens * 0.6);

    const costs = calculateAllCosts({ monthlyInput, monthlyOutput }, inputs.useCase);
    const recommendation = getRecommendation(costs, inputs.currentProvider);

    return {
      costs,
      recommendation,
      monthlyTokens,
      monthlyInput,
      monthlyOutput,
      monthlyMessages,
    };
  }, [inputs]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>⚡ OpenClaw Usage Calculator</h1>
          <p className="subtitle">
            Compare AI provider costs and find the cheapest option for your usage
          </p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Calculator inputs={inputs} onChange={setInputs} />
          <Results results={results} currentProvider={inputs.currentProvider} />
        </div>
      </main>

      <footer className="footer">
        <p>
          Built for the OpenClaw community · 
          <a href="https://github.com/fengweit/openclaw-usages" target="_blank" rel="noopener">GitHub</a> · 
          <a href="https://www.npmjs.com/package/openclaw-usage" target="_blank" rel="noopener">CLI Tool</a> · 
          MIT License
        </p>
      </footer>
    </div>
  );
}

export default App;
