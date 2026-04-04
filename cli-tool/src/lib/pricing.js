/**
 * AI Provider Pricing Data (April 2026)
 * All prices in USD per million tokens
 */

const PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    models: {
      'claude-opus': {
        name: 'Claude Opus 4',
        input: 15.0,
        output: 75.0,
        tier: 'premium',
        quality: 98,
        contextWindow: 200000,
      },
      'claude-sonnet': {
        name: 'Claude Sonnet 4',
        input: 3.0,
        output: 15.0,
        tier: 'standard',
        quality: 90,
        contextWindow: 200000,
      },
      'claude-haiku': {
        name: 'Claude Haiku 3.5',
        input: 0.25,
        output: 1.25,
        tier: 'budget',
        quality: 75,
        contextWindow: 200000,
      },
    },
  },
  openai: {
    name: 'OpenAI',
    models: {
      'gpt-4o': {
        name: 'GPT-4o',
        input: 2.5,
        output: 10.0,
        tier: 'standard',
        quality: 91,
        contextWindow: 128000,
      },
      'gpt-4o-mini': {
        name: 'GPT-4o Mini',
        input: 0.15,
        output: 0.6,
        tier: 'budget',
        quality: 78,
        contextWindow: 128000,
      },
      'gpt-4-turbo': {
        name: 'GPT-4 Turbo',
        input: 10.0,
        output: 30.0,
        tier: 'premium',
        quality: 93,
        contextWindow: 128000,
      },
    },
  },
  google: {
    name: 'Google',
    models: {
      'gemini-pro': {
        name: 'Gemini 2.5 Pro',
        input: 1.25,
        output: 5.0,
        tier: 'standard',
        quality: 89,
        contextWindow: 1000000,
      },
      'gemini-flash': {
        name: 'Gemini 2.0 Flash',
        input: 0.075,
        output: 0.3,
        tier: 'budget',
        quality: 76,
        contextWindow: 1000000,
      },
      'gemini-flash-8b': {
        name: 'Gemini Flash 8B',
        input: 0.0375,
        output: 0.15,
        tier: 'economy',
        quality: 65,
        contextWindow: 1000000,
      },
    },
  },
};

/**
 * Calculate cost for a specific model
 * @param {string} modelKey - e.g., 'claude-opus', 'gpt-4o'
 * @param {number} inputTokens - Total input tokens
 * @param {number} outputTokens - Total output tokens
 * @returns {{ cost: number, breakdown: { input: number, output: number } }}
 */
function calculateCost(modelKey, inputTokens, outputTokens) {
  const model = findModel(modelKey);
  if (!model) {
    throw new Error(`Unknown model: ${modelKey}`);
  }

  const inputCost = (inputTokens / 1_000_000) * model.input;
  const outputCost = (outputTokens / 1_000_000) * model.output;

  return {
    cost: inputCost + outputCost,
    breakdown: { input: inputCost, output: outputCost },
  };
}

/**
 * Estimate monthly tokens from usage patterns
 * @param {number} messagesPerDay - Average messages sent per day
 * @param {number} avgTokensPerMessage - Average tokens per message (input + output)
 * @param {number} inputOutputRatio - Ratio of input to output tokens (default 0.4 = 40% input)
 * @returns {{ monthlyInput: number, monthlyOutput: number, monthlyTotal: number }}
 */
function estimateMonthlyTokens(messagesPerDay, avgTokensPerMessage = 2000, inputOutputRatio = 0.4) {
  const monthlyMessages = messagesPerDay * 30;
  const monthlyTotal = monthlyMessages * avgTokensPerMessage;
  const monthlyInput = Math.round(monthlyTotal * inputOutputRatio);
  const monthlyOutput = Math.round(monthlyTotal * (1 - inputOutputRatio));

  return { monthlyInput, monthlyOutput, monthlyTotal };
}

/**
 * Get costs for all providers given a usage profile
 * @param {{ monthlyInput: number, monthlyOutput: number }} usage
 * @returns {Array<{ provider: string, model: string, modelKey: string, tier: string, quality: number, monthlyCost: number, inputCost: number, outputCost: number }>}
 */
function getAllProviderCosts(usage) {
  const results = [];

  for (const [providerKey, provider] of Object.entries(PROVIDERS)) {
    for (const [modelKey, model] of Object.entries(provider.models)) {
      const { cost, breakdown } = calculateCost(modelKey, usage.monthlyInput, usage.monthlyOutput);
      results.push({
        provider: provider.name,
        model: model.name,
        modelKey,
        tier: model.tier,
        quality: model.quality,
        monthlyCost: cost,
        inputCost: breakdown.input,
        outputCost: breakdown.output,
      });
    }
  }

  return results.sort((a, b) => a.monthlyCost - b.monthlyCost);
}

/**
 * Calculate hybrid routing cost (70% budget, 30% premium)
 * @param {{ monthlyInput: number, monthlyOutput: number }} usage
 * @returns {{ monthlyCost: number, budgetModel: string, premiumModel: string, savings: number }}
 */
function calculateHybridCost(usage) {
  const budgetUsage = {
    monthlyInput: Math.round(usage.monthlyInput * 0.7),
    monthlyOutput: Math.round(usage.monthlyOutput * 0.7),
  };
  const premiumUsage = {
    monthlyInput: Math.round(usage.monthlyInput * 0.3),
    monthlyOutput: Math.round(usage.monthlyOutput * 0.3),
  };

  const budgetCost = calculateCost('gemini-flash', budgetUsage.monthlyInput, budgetUsage.monthlyOutput);
  const premiumCost = calculateCost('claude-sonnet', premiumUsage.monthlyInput, premiumUsage.monthlyOutput);
  const hybridTotal = budgetCost.cost + premiumCost.cost;

  // Compare vs using Claude Sonnet for everything
  const fullSonnetCost = calculateCost('claude-sonnet', usage.monthlyInput, usage.monthlyOutput);
  const savings = fullSonnetCost.cost - hybridTotal;

  return {
    monthlyCost: hybridTotal,
    budgetModel: 'Gemini 2.0 Flash',
    premiumModel: 'Claude Sonnet 4',
    savings,
    savingsPercent: ((savings / fullSonnetCost.cost) * 100).toFixed(1),
  };
}

/**
 * Find a model by key across all providers
 */
function findModel(modelKey) {
  for (const provider of Object.values(PROVIDERS)) {
    if (provider.models[modelKey]) {
      return provider.models[modelKey];
    }
  }
  return null;
}

/**
 * Get all model keys as a flat list
 */
function getAllModelKeys() {
  const keys = [];
  for (const provider of Object.values(PROVIDERS)) {
    keys.push(...Object.keys(provider.models));
  }
  return keys;
}

/**
 * Get model display name
 */
function getModelName(modelKey) {
  const model = findModel(modelKey);
  return model ? model.name : modelKey;
}

module.exports = {
  PROVIDERS,
  calculateCost,
  estimateMonthlyTokens,
  getAllProviderCosts,
  calculateHybridCost,
  findModel,
  getAllModelKeys,
  getModelName,
};
