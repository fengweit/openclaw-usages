/**
 * AI Provider Pricing Data — April 2026
 * Prices are per 1 million tokens
 */
export const PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    models: {
      'claude-opus': {
        name: 'Claude Opus',
        inputPrice: 15.00,
        outputPrice: 75.00,
        quality: { coding: 5, chat: 5, analysis: 5, creative: 5 },
        description: 'Most capable model, best for complex reasoning',
      },
      'claude-sonnet': {
        name: 'Claude Sonnet',
        inputPrice: 3.00,
        outputPrice: 15.00,
        quality: { coding: 5, chat: 4, analysis: 4, creative: 4 },
        description: 'Excellent balance of capability and cost',
      },
      'claude-haiku': {
        name: 'Claude Haiku',
        inputPrice: 0.25,
        outputPrice: 1.25,
        quality: { coding: 3, chat: 4, analysis: 3, creative: 3 },
        description: 'Fast and affordable for simple tasks',
      },
    },
  },
  openai: {
    name: 'OpenAI',
    models: {
      'gpt-4o': {
        name: 'GPT-4o',
        inputPrice: 2.50,
        outputPrice: 10.00,
        quality: { coding: 4, chat: 5, analysis: 4, creative: 4 },
        description: 'Flagship multimodal model',
      },
      'gpt-4o-mini': {
        name: 'GPT-4o-mini',
        inputPrice: 0.15,
        outputPrice: 0.60,
        quality: { coding: 3, chat: 4, analysis: 3, creative: 3 },
        description: 'Cost-effective for most use cases',
      },
      'gpt-4-turbo': {
        name: 'GPT-4 Turbo',
        inputPrice: 10.00,
        outputPrice: 30.00,
        quality: { coding: 4, chat: 4, analysis: 5, creative: 4 },
        description: 'High capability with large context window',
      },
    },
  },
  google: {
    name: 'Google',
    models: {
      'gemini-pro': {
        name: 'Gemini Pro',
        inputPrice: 1.25,
        outputPrice: 5.00,
        quality: { coding: 4, chat: 4, analysis: 4, creative: 3 },
        description: 'Strong general-purpose model',
      },
      'gemini-flash': {
        name: 'Gemini Flash',
        inputPrice: 0.075,
        outputPrice: 0.30,
        quality: { coding: 3, chat: 3, analysis: 3, creative: 2 },
        description: 'Ultra-fast, great for high-volume workloads',
      },
      'gemini-flash-8b': {
        name: 'Gemini Flash-8B',
        inputPrice: 0.0375,
        outputPrice: 0.15,
        quality: { coding: 2, chat: 2, analysis: 2, creative: 1 },
        description: 'Cheapest option, suitable for simple tasks',
      },
    },
  },
}

/**
 * Token estimates by message length
 */
const TOKEN_ESTIMATES = {
  short: 500,
  medium: 1500,
  long: 4000
}

/**
 * Calculate cost for a given model and token usage
 */
export function calculateCost(modelKey, inputTokens, outputTokens) {
  const model = getModel(modelKey)
  if (!model) return 0
  
  const inputCost = (inputTokens / 1_000_000) * model.inputPrice
  const outputCost = (outputTokens / 1_000_000) * model.outputPrice
  return inputCost + outputCost
}

/**
 * Get model by key
 */
export function getModel(modelKey) {
  for (const provider of Object.values(PROVIDERS)) {
    if (provider.models[modelKey]) {
      return provider.models[modelKey]
    }
  }
  return null
}

/**
 * Get provider name for a model key
 */
export function getProviderName(modelKey) {
  for (const [, provider] of Object.entries(PROVIDERS)) {
    if (provider.models[modelKey]) {
      return provider.name
    }
  }
  return null
}

/**
 * Calculate all costs based on user inputs
 */
export function calculateAllCosts(inputs) {
  const { messagesPerDay, messageLength, useCase, currentProvider } = inputs
  
  // Calculate token usage
  const tokensPerMessage = TOKEN_ESTIMATES[messageLength] || 1500
  const monthlyTokens = messagesPerDay * 30 * tokensPerMessage
  const monthlyInputTokens = Math.round(monthlyTokens * 0.6)  // 60% input
  const monthlyOutputTokens = Math.round(monthlyTokens * 0.4)  // 40% output
  
  // Calculate costs for all models
  const costs = []
  
  for (const [providerKey, provider] of Object.entries(PROVIDERS)) {
    for (const [modelKey, model] of Object.entries(provider.models)) {
      const monthlyCost = calculateCost(modelKey, monthlyInputTokens, monthlyOutputTokens)
      
      costs.push({
        provider: provider.name,
        providerKey,
        model: model.name,
        modelKey,
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        inputPrice: model.inputPrice,
        outputPrice: model.outputPrice,
        quality: model.quality,
        description: model.description,
      })
    }
  }
  
  // Sort by cost
  costs.sort((a, b) => a.monthlyCost - b.monthlyCost)
  
  // Find current cost
  const currentModel = costs.find(c => c.modelKey === currentProvider)
  const currentCost = currentModel?.monthlyCost || null
  
  // Find cheapest
  const cheapest = costs[0]
  
  // Find recommended (good quality + reasonable cost)
  const recommended = costs.find(c => {
    const qualityScore = c.quality[useCase] || 3
    return qualityScore >= 4 && c.monthlyCost <= (costs[Math.floor(costs.length / 2)]?.monthlyCost || Infinity)
  }) || costs.find(c => (c.quality[useCase] || 3) >= 4) || cheapest
  
  // Max cost for chart scaling
  const maxCost = Math.max(...costs.map(c => c.monthlyCost))
  
  return {
    costs,
    currentCost,
    cheapest,
    recommended,
    maxCost,
    usage: {
      monthlyInputTokens,
      monthlyOutputTokens,
      monthlyTokens,
      messagesPerMonth: messagesPerDay * 30
    }
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format large numbers
 */
export function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}
