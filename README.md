# OpenClaw Usage Analyzer

Understand exactly how you're using OpenClaw — real data, not guesswork.

**Status:** POC (v0.1) — Web cost calculator live, CLI analyzer planned  
**Repo:** [github.com/fengweit/openclaw-usages](https://github.com/fengweit/openclaw-usages)

---

## What's Working Now

### 🌐 Web Cost Calculator (POC)

A React app that lets you compare AI provider costs interactively.

**URL:** `http://localhost:3000` (when dev server is running)

**Features:**
- Interactive messages/day slider (5–500)
- Message length toggle (short ~500 tokens / medium ~2K / long ~5K)
- Use case selector (coding, chat, analysis, creative)
- Current provider dropdown (9 models across Anthropic, OpenAI, Google)
- Real-time cost comparison bar chart
- Provider cards with quality scores and savings percentages
- Hybrid routing preview (70% budget model + 30% premium model)
- Dark theme, responsive layout

**How to run:**
```bash
cd web-calculator
npm install
npm run dev
# Opens http://localhost:3000
```

**Limitations (POC):**
- Based on estimated usage (user inputs), not real data
- Quality scores are approximate
- No data persistence

### 💻 CLI Tool (POC)

A Node.js CLI with cost analysis and migration commands.

**Commands available:**
```bash
cd cli-tool && npm install

# Compare costs across all providers
node src/index.js optimize

# Interactive migration wizard
node src/index.js migrate

# Usage statistics dashboard (demo data)
node src/index.js stats

# View/edit settings
node src/index.js config

# Rollback to previous config
node src/index.js rollback

# Pro tier upgrade flow
node src/index.js upgrade
```

**`optimize` command:**
- Asks your current model, daily messages, message complexity
- Shows cost comparison table across 9 models
- Highlights cheapest option and best value
- Shows hybrid routing savings estimate

**`stats` command:**
- Displays demo data dashboard (no real tracking yet)
- Daily/weekly/monthly breakdown with cost trends
- Model usage breakdown
- Budget status

**`migrate` command:**
- Detects OpenClaw config at `~/.openclaw/config.yaml`
- Interactive provider/model selection
- Auto-backup before migration
- Writes new config and validates

### 📚 Documentation

Full project documentation in `docs/`:

| File | Contents |
|------|----------|
| `docs/01-CRISIS-ANALYSIS.md` | Crisis timeline, user segments, market size |
| `docs/02-ARCHITECTURAL-GAPS.md` | 8 technical gaps = business opportunities |
| `docs/03-PRODUCT-SPECS.md` | CLI and web calculator specifications |
| `docs/04-REVENUE-MODEL.md` | 5 revenue streams with projections |
| `docs/05-BUILD-PLAN.md` | 7-day build schedule |
| `docs/06-LAUNCH-STRATEGY.md` | Reddit, Twitter, HN, Discord, YouTube launch plan |
| `research/RESEARCH-SUMMARY.md` | Market research synthesis |

---

## What's Next (V1 — Real Usage Analysis)

The POC uses estimated/hypothetical inputs. **V1 will parse your actual OpenClaw session data** instead.

See [PLAN.md](./PLAN.md) for the full V1 specification.

### The key insight

OpenClaw stores per-message usage in `~/.openclaw/agents/*/sessions/*.jsonl`:
```json
{
  "type": "message",
  "message": {
    "role": "assistant",
    "provider": "anthropic",
    "model": "claude-opus-4-6",
    "usage": {
      "input": 3,
      "output": 142,
      "cacheRead": 0,
      "cacheWrite": 23330,
      "totalTokens": 23475,
      "cost": { "total": 0.14937 }
    }
  }
}
```

V1 will parse this data to show:
- **Actual spend** by model, by day, by session
- **Cache efficiency** — how much caching is saving you
- **What-if comparisons** — same real tokens priced on other providers
- **Smart recommendations** — which queries could use cheaper models

### V1 Commands (planned)

```bash
# Analyze your actual OpenClaw usage
openclaw-usage analyze              # Last 30 days
openclaw-usage analyze --days 7     # Last week
openclaw-usage analyze --all-agents # All agents, not just main

# Compare actual costs against alternatives
openclaw-usage compare              # What-if on all providers
openclaw-usage compare --model gpt-4o  # Specific model

# Export raw data
openclaw-usage export --format csv -o usage.csv
```

### V1 Web Dashboard (planned)

- Drag & drop JSONL files (or auto-detect local path)
- All processing client-side (no data leaves the browser)
- Summary cards, model breakdown charts, daily trend bars
- Interactive what-if comparison

---

## Project Structure

```
openclaw-usages/
├── README.md              ← You are here
├── PLAN.md                ← V1 detailed specification
├── cli-tool/              ← CLI tool (POC)
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── index.js       # Entry point (commander)
│       ├── commands/
│       │   ├── optimize.js   # Cost comparison
│       │   ├── migrate.js    # Provider migration
│       │   ├── stats.js      # Usage dashboard
│       │   ├── rollback.js   # Config rollback
│       │   ├── config.js     # Settings
│       │   └── upgrade.js    # Pro tier
│       └── lib/
│           └── pricing.js    # Provider pricing data
├── web-calculator/        ← Web app (POC)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── README.md
│   └── src/
│       ├── main.jsx
│       ├── App.jsx + .css
│       ├── lib/
│       │   └── calculator.js  # Pricing & calculation logic
│       └── components/
│           ├── Calculator.jsx + .css   # Input form
│           ├── Results.jsx + .css      # Results container
│           ├── ProviderCard.jsx + .css  # Provider cost cards
│           └── CostChart.jsx + .css    # Bar chart
├── docs/                  ← Project documentation
│   ├── 01-CRISIS-ANALYSIS.md
│   ├── 02-ARCHITECTURAL-GAPS.md
│   ├── 03-PRODUCT-SPECS.md
│   ├── 04-REVENUE-MODEL.md
│   ├── 05-BUILD-PLAN.md
│   └── 06-LAUNCH-STRATEGY.md
└── research/
    └── RESEARCH-SUMMARY.md
```

## Supported Providers (Pricing Data)

| Provider | Model | Input $/M | Output $/M | Tier |
|----------|-------|-----------|------------|------|
| Anthropic | Claude Opus 4 | $15.00 | $75.00 | Premium |
| Anthropic | Claude Sonnet 4 | $3.00 | $15.00 | Standard |
| Anthropic | Claude Haiku 3.5 | $0.25 | $1.25 | Budget |
| OpenAI | GPT-4o | $2.50 | $10.00 | Standard |
| OpenAI | GPT-4o Mini | $0.15 | $0.60 | Budget |
| OpenAI | GPT-4 Turbo | $10.00 | $30.00 | Premium |
| Google | Gemini 2.5 Pro | $1.25 | $5.00 | Standard |
| Google | Gemini 2.0 Flash | $0.075 | $0.30 | Budget |
| Google | Gemini Flash 8B | $0.0375 | $0.15 | Economy |

## License

MIT — [Fengwei Tian](https://github.com/fengweit)
