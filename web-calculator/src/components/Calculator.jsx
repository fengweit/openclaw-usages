import React from 'react';
import { PROVIDERS } from '../lib/calculator';
import './Calculator.css';

function Calculator({ inputs, onChange }) {
  const update = (key, value) => {
    onChange({ ...inputs, [key]: value });
  };

  return (
    <div className="calculator">
      <h2>📝 Your Usage</h2>

      <div className="field">
        <label>
          Messages per day
          <span className="value-badge">{inputs.messagesPerDay}</span>
        </label>
        <input
          type="range"
          min="5"
          max="500"
          step="5"
          value={inputs.messagesPerDay}
          onChange={(e) => update('messagesPerDay', parseInt(e.target.value))}
        />
        <div className="range-labels">
          <span>5</span>
          <span>250</span>
          <span>500</span>
        </div>
      </div>

      <div className="field">
        <label>Average message length</label>
        <div className="button-group">
          {[
            { value: 'short', label: 'Short', desc: '~500 tokens' },
            { value: 'medium', label: 'Medium', desc: '~2K tokens' },
            { value: 'long', label: 'Long', desc: '~5K tokens' },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`toggle-btn ${inputs.messageLength === opt.value ? 'active' : ''}`}
              onClick={() => update('messageLength', opt.value)}
            >
              <span className="btn-label">{opt.label}</span>
              <span className="btn-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Primary use case</label>
        <div className="button-group">
          {[
            { value: 'coding', label: '💻 Coding' },
            { value: 'chat', label: '💬 Chat' },
            { value: 'analysis', label: '📊 Analysis' },
            { value: 'creative', label: '✍️ Creative' },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`toggle-btn small ${inputs.useCase === opt.value ? 'active' : ''}`}
              onClick={() => update('useCase', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Current provider</label>
        <select
          value={inputs.currentProvider}
          onChange={(e) => update('currentProvider', e.target.value)}
        >
          {Object.entries(PROVIDERS).map(([key, model]) => (
            <option key={key} value={key}>
              {model.provider} — {model.name}
            </option>
          ))}
        </select>
      </div>

      <div className="usage-summary">
        <h3>📊 Monthly Estimate</h3>
        <div className="summary-row">
          <span>Messages</span>
          <span>{(inputs.messagesPerDay * 30).toLocaleString()}</span>
        </div>
        <div className="summary-row">
          <span>Tokens</span>
          <span>
            {(
              inputs.messagesPerDay *
              30 *
              ({ short: 500, medium: 2000, long: 5000 }[inputs.messageLength] || 2000)
            ).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Calculator;
