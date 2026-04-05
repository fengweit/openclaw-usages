import React from 'react';
import { fmtCost, fmtTokens } from '../lib/api';
import './TopMessages.css';

const COST_DRIVER_LABELS = {
  cache_write: { icon: '📝', label: 'New context loaded', desc: 'First message in session or new files read — cache must be written' },
  output: { icon: '📤', label: 'Large response', desc: 'Long assistant response with lots of output tokens' },
  cache_read: { icon: '🗄️', label: 'Cache read', desc: 'Reading from cached context — cheapest token type' },
  input: { icon: '📥', label: 'Large prompt', desc: 'Big user prompt or lots of context sent' },
};

function TopMessages({ messages }) {
  return (
    <div className="top-messages">
      <div className="top-msg-header">
        <h2>🔍 Most Expensive Messages</h2>
        <p className="top-msg-subtitle">
          Your costliest API calls — with context on <em>what</em> triggered them and <em>why</em> they're expensive.
        </p>
      </div>

      <div className="msg-list">
        {messages.slice(0, 30).map((msg, i) => {
          const driver = COST_DRIVER_LABELS[msg.costDriver] || {};

          return (
            <div key={msg.id || i} className="msg-row">
              <div className="msg-rank">#{i + 1}</div>
              <div className="msg-detail">
                {/* Header: model + time + cost driver */}
                <div className="msg-top">
                  <span className="msg-model">{msg.model}</span>
                  <span className={`msg-driver ${msg.costDriver || ''}`}>
                    {driver.icon} {driver.label}
                  </span>
                  <span className="msg-time">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '—'}
                  </span>
                </div>

                {/* User prompt that triggered this */}
                {msg.userPrompt && (
                  <div className="msg-prompt">
                    <span className="prompt-label">❓ Asked:</span>
                    <span className="prompt-text">"{msg.userPrompt}"</span>
                  </div>
                )}

                {/* What the assistant did */}
                {msg.responseSummary && (
                  <div className="msg-response">
                    <span className="response-label">💬 Did:</span>
                    <span className="response-text">{msg.responseSummary}</span>
                  </div>
                )}

                {/* Token breakdown */}
                <div className="msg-tokens">
                  {msg.cacheWrite > 0 && (
                    <span className="token-tag write">
                      {fmtTokens(msg.cacheWrite)} cache write → {fmtCost(msg.cost.cacheWrite)}
                    </span>
                  )}
                  {msg.outputTokens > 0 && (
                    <span className="token-tag output">
                      {fmtTokens(msg.outputTokens)} output → {fmtCost(msg.cost.output)}
                    </span>
                  )}
                  {msg.cacheRead > 0 && (
                    <span className="token-tag read">
                      {fmtTokens(msg.cacheRead)} cache read → {fmtCost(msg.cost.cacheRead)}
                    </span>
                  )}
                  {msg.inputTokens > 0 && (
                    <span className="token-tag input">
                      {fmtTokens(msg.inputTokens)} input → {fmtCost(msg.cost.input)}
                    </span>
                  )}
                </div>

                {/* Why explanation */}
                {driver.desc && (
                  <div className="msg-why">
                    💡 {driver.desc}
                  </div>
                )}

                {msg.sessionLabel && (
                  <div className="msg-session">Session: {msg.sessionLabel}</div>
                )}
              </div>
              <div className="msg-cost">{fmtCost(msg.cost.total)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TopMessages;
