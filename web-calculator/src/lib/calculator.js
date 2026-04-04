/**
 * AI Provider Pricing & Calculator Logic
 * April 2026 pricing data — all prices in USD per million tokens
 */

export const PROVIDERS = {
  'claude-opus': {
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    input: 15.0,
    output: 75.0,
    tier: 'premium',
    color: '#d97706',
    quality: { coding: 98, chat: 95, analysis: 97, creative: 96 },
  },
  'claude-sonnet': {
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    input: 3.0,
    output: 15.0,
    tier: 'standard',
    color: '#d97706',
    quality: { coding: 90, chat: 88, analysis: 91, creative: 89 },
  },
  'claude-haiku': {
    name: 'Claude Haiku 3.5',
    provider: 'Anthropic',
    input: 0.25,
    output: 1.25,
    tier: 'budget',
    color: '#d97706',
    quality: { coding: 72, chat: 78, analysis: 70, creative: 68 },
  },
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'OpenAI',
    input: 2.5,
    output: 10.0,
    tier: 'standard',
    color: '#10b981',
    quality: { coding: 91, chat: 90, analysis: 89, creative: 87 },
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    input: 0.15,
    output: 0.6,
    tier: 'budget',
    color: '#10b981',
    quality: { coding: 75, chat: 80, analysis: 73, creative: 70 },
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    input: 10.0,
    output: 30.0,
    tier: 'premium',
    color: '#10b981',
    quality: { coding: 93, chat: 91, analysis: 92, creative: 90 },
  },
  'gemini-pro': {
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    input: 1.25,
    output: 5.0,
    tier: 'standard',
    color: '#3b82f6',
    quality: { coding: 89, chat: 86, analysis: 90, creative: 84 },
  },
  'gemini-flash': {
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    input: 0.075,
    output: 0.3,
    tier: 'budget',
    color: '#3b82f6',
    quality: { coding: 74, chat: 76, analysis: 72, creative: 65 },
  },
  'gemini-flash-8b': {
    name: 'Gemini Flash 8B',
    provider: 'Google',
    input: 0.0375,
    output: 0.15,
    tier: 'economy',
    color: '#3b82f6',
    quality: { coding: 60, chat: 65, analysis: 58, creative: 55 },
  },
};

/**
 * Calculate cost for a model given token usage
 */
export function calculateCost(modelKey, inputTokens, outputTokens) {
  const model = PROVIDERS[modelKey];
  if (!model) return { cost: 0, input: 0, output: 0 };

  const inputCost = (inputTokens / 1_000_000) * model.input;
  const outputCost = (outputTokens / 1_000_000) * model.output;

  return {
    cost: inputCost + outputCost,
    input: inputCost,
    output: outputCost,
  };
}

/**
 * Calculate costs for all providers given usage and use case
 */
export function calculateAllCosts(usage, useCase = 'coding') {
  const results = Object.entries(PROVIDERS).map(([key, model]) => {
    const costs = calculateCost(key, usage.monthlyInput, usage.monthlyOutput);
    return {
      key,
      ...model,
      monthlyCost: costs.cost,
      inputCost: costs.input,
      outputCost: costs.output,
      qualityScore: model.quality[useCase] || model.quality.coding,
    };
  });

  return results.sort((a, b) => a.monthlyCost - b.monthlyCost);
}

/**
 * Calculate hybrid routing cost estimate (70% budget, 30% premium)
 */
export function calculateHybridCost(usage) {
  const budgetUsage = {
    monthlyInput: Math.round(usage.monthlyInput * 0.7),
    monthlyOutput: Math.round(usage.monthlyOutput * 0.7),
  };
  const premiumUsage = {
    monthlyInput: Math.round(usage.monthlyInput * 0.3),
    monthlyOutput: Math.round(usage.monthlyOutput * 0.3),
  };

  const budget = calculateCost('gemini-flash', budgetUsage.monthlyInput, budgetUsage.monthlyOutput);
  const premium = calculateCost('claude-sonnet', premiumUsage.monthlyInput, premiumUsage.monthlyOutput);

  return {
    monthlyCost: budget.cost + premium.cost,
    budgetModel: 'Gemini 2.0 Flash',
    premiumModel: 'Claude Sonnet 4',
    qualityScore: 85,
  };
}

/**
 * Get recommendation based on results and current provider
 */
export function getRecommendation(costs, currentProviderKey) {
  const current = costs.find((c) => c.key === currentProviderKey);
  const cheapest = costs[0];
  const bestValue = costs.find((c) => c.qualityScore >= 85 && c.tier === 'standard');

  const currentCost = current ? current.monthlyCost : 0;
  const maxSavings = currentCost - cheapest.monthlyCost;

  return {
    cheapest,
    bestValue: bestValue || cheapest,
    current,
    maxSavings,
    maxSavingsPercent: currentCost > 0 ? ((maxSavings / currentCost) * 100).toFixed(1) : '0',
  };
}
