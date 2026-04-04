const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3099';

export async function fetchUsageData() {
  const res = await fetch(`${API_BASE}/api/usage`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchSessionDetail(sessionId) {
  const res = await fetch(`${API_BASE}/api/usage/session/${sessionId}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function refreshData() {
  const res = await fetch(`${API_BASE}/api/usage/refresh`, { method: 'POST' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Format cost as dollar amount
 */
export function fmtCost(cost) {
  if (cost >= 1) return `$${cost.toFixed(2)}`;
  if (cost >= 0.01) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(4)}`;
}

/**
 * Format token count with suffix
 */
export function fmtTokens(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/**
 * Format percentage
 */
export function fmtPct(ratio) {
  return `${(ratio * 100).toFixed(1)}%`;
}
