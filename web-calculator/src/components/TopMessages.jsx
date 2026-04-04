import React from 'react';
import { fmtCost, fmtTokens } from '../lib/api';
import './TopMessages.css';

function TopMessages({ messages }) {
  return (
    <div className="top-messages">
      <div className="top-msg-header">
        <h2>💬 Most Expensive Messages</h2>
        <p className="top-msg-subtitle">
          Your costliest single API calls. These are where optimization has the biggest impact.
        </p>
      </div>

      <div className="msg-list">
        {messages.slice(0, 30).map((msg, i) => {
          const costParts = [];
          if (msg.cost.cacheWrite > 0) costParts.push(`cache write: ${fmtCost(msg.cost.cacheWrite)}`);
          if (msg.cost.output > 0) costParts.push(`output: ${fmtCost(msg.cost.output)}`);
          if (msg.cost.cacheRead > 0) costParts.push(`cache read: ${fmtCost(msg.cost.cacheRead)}`);
          if (msg.cost.input > 0) costParts.push(`input: ${fmtCost(msg.cost.input)}`);

          return (
            <div key={msg.id || i} className="msg-row">
              <div className="msg-rank">#{i + 1}</div>
              <div className="msg-detail">
                <div className="msg-top">
                  <span className="msg-model">{msg.model}</span>
                  <span className="msg-time">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '—'}
                  </span>
                </div>
                <div className="msg-tokens">
                  {fmtTokens(msg.totalTokens)} tokens
                  <span className="sep">·</span>
                  {fmtTokens(msg.outputTokens)} out
                  <span className="sep">·</span>
                  {fmtTokens(msg.cacheWrite)} cache write
                  {msg.cacheRead > 0 && (
                    <>
                      <span className="sep">·</span>
                      {fmtTokens(msg.cacheRead)} cache read
                    </>
                  )}
                </div>
                <div className="msg-breakdown">{costParts.join(' · ')}</div>
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
