import React, { useState } from 'react';
import { fmtCost, fmtTokens } from '../lib/api';
import './SessionTable.css';

function SessionTable({ sessions }) {
  const [sort, setSort] = useState('cost');
  const [filter, setFilter] = useState('');
  const [kindFilter, setKindFilter] = useState('all');

  const filtered = sessions
    .filter(s => {
      if (kindFilter !== 'all' && s.kind !== kindFilter) return false;
      if (filter) {
        const q = filter.toLowerCase();
        return (
          (s.label || '').toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.models.some(m => m.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'cost') return b.cost - a.cost;
      if (sort === 'messages') return b.messages - a.messages;
      if (sort === 'recent') return (b.lastMessage || '').localeCompare(a.lastMessage || '');
      return 0;
    });

  const kinds = [...new Set(sessions.map(s => s.kind))];

  return (
    <div className="session-table-wrap">
      <div className="table-controls">
        <input
          type="text"
          placeholder="Search sessions..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="search-input"
        />
        <div className="filter-group">
          <select value={kindFilter} onChange={e => setKindFilter(e.target.value)}>
            <option value="all">All types</option>
            {kinds.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="cost">Sort: Cost ↓</option>
            <option value="messages">Sort: Messages ↓</option>
            <option value="recent">Sort: Recent ↓</option>
          </select>
        </div>
      </div>

      <div className="table-scroll">
        <table className="session-table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Type</th>
              <th>Model</th>
              <th className="num">Messages</th>
              <th className="num">Output</th>
              <th className="num">Cache</th>
              <th className="num">Cost</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td className="session-name">
                  <span className="session-label">{s.label || s.id.slice(0, 12)}</span>
                </td>
                <td>
                  <span className={`kind-badge ${s.kind}`}>{s.kind}</span>
                </td>
                <td className="model-cell">
                  {s.models.map(m => (
                    <span key={m} className="model-tag">{m.replace('claude-', '')}</span>
                  ))}
                </td>
                <td className="num">{s.messages}</td>
                <td className="num">{fmtTokens(s.outputTokens)}</td>
                <td className="num">{fmtTokens(s.cacheRead)}</td>
                <td className="num cost-cell">{fmtCost(s.cost)}</td>
                <td className="time-cell">
                  {s.lastMessage ? new Date(s.lastMessage).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        Showing {filtered.length} of {sessions.length} sessions
      </div>
    </div>
  );
}

export default SessionTable;
