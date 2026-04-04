# OpenClaw Usage Analyzer — V1 Plan

## Sharp Focus: Understand Your OpenClaw Usage

**One job:** Parse your real OpenClaw session data, show you exactly what you're spending, and compare it against what you'd spend with other providers/models.

No hypotheticals. No "enter your estimated usage." **Real data from your actual sessions.**

---

## The Data Source

OpenClaw stores per-message usage in `~/.openclaw/agents/*/sessions/*.jsonl`:

```json
{
  "type": "message",
  "message": {
    "role": "assistant",
    "provider": "anthropic",
    "model": "claude-opus-4-6",
    "usage": {
      "input": 3,           // input tokens (thousands? raw?)
      "output": 142,         // output tokens
      "cacheRead": 0,        // prompt cache hits
      "cacheWrite": 23330,   // prompt cache writes
      "totalTokens": 23475,
      "cost": {
        "input": 0.000015,
        "output": 0.00355,
        "cacheRead": 0,
        "cacheWrite": 0.14581,
        "total": 0.14937
      }
    },
    "stopReason": "toolUse",
    "timestamp": 1775327991849
  }
}
```

**This is everything we need.** Real models, real tokens, real costs, real timestamps.

---

## V1 Architecture

### CLI Tool: `openclaw-usage analyze`

**One command. One output. Sharp.**

```
$ openclaw-usage analyze

⚡ OpenClaw Usage Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Period: Mar 2 – Apr 4, 2026 (33 days)
📂 Sessions: 175 analyzed

💰 TOTAL SPEND
   Actual cost:     $47.82
   Daily average:   $1.45/day
   Projected month: $43.50/month

🤖 MODEL BREAKDOWN
┌────────────────────┬──────────┬────────────┬──────────┬─────────┐
│ Model              │ Messages │ Tokens     │ Cost     │ % Spend │
├────────────────────┼──────────┼────────────┼──────────┼─────────┤
│ claude-opus-4-6    │ 847      │ 12.4M      │ $38.21   │ 79.9%   │
│ claude-sonnet-4    │ 234      │ 3.1M       │ $6.42    │ 13.4%   │
│ claude-haiku-4-5   │ 89       │ 1.2M       │ $0.94    │ 2.0%    │
│ gpt-4.1-mini       │ 156      │ 2.8M       │ $2.25    │ 4.7%    │
└────────────────────┴──────────┴────────────┴──────────┴─────────┘

📊 CACHE EFFICIENCY
   Cache reads:      45.2% of input tokens
   Cache savings:    ~$12.40 saved via caching
   Without cache:    ~$60.22 (you're saving 21%)

📈 DAILY TREND (last 14 days)
   Apr 4  ████████████████████ $3.21
   Apr 3  ████████████         $1.89
   Apr 2  ██████               $0.94
   ...

💡 WHAT-IF: Same usage on other providers
┌────────────────────┬────────────┬─────────────┬──────────┐
│ Provider/Model     │ Monthly    │ vs Current  │ Quality  │
├────────────────────┼────────────┼─────────────┼──────────┤
│ Your actual mix    │ $43.50     │ baseline    │ —        │
│ All GPT-4o         │ $28.40     │ -$15.10     │ ~same    │
│ All Gemini Pro     │ $14.20     │ -$29.30     │ slight ↓ │
│ All Claude Sonnet  │ $18.90     │ -$24.60     │ slight ↓ │
│ All GPT-4o-mini    │ $1.82      │ -$41.68     │ ↓↓       │
│ All Gemini Flash   │ $0.91      │ -$42.59     │ ↓↓↓      │
│ Hybrid (smart)     │ $8.50      │ -$35.00     │ slight ↓ │
└────────────────────┴────────────┴─────────────┴──────────┘

🎯 RECOMMENDATION
   You spend 80% on Opus. If you switched complex tasks (30%)
   to Sonnet and simple tasks (50%) to Haiku, you'd pay ~$12/mo
   instead of $43.50 — saving $31.50/month.
```

### Web Dashboard: Visual version

Same data, but visual. Charts, trends, interactive model comparison.

---

## V1 File Structure (Simplified)

```
openclaw-usages/
├── README.md                  # What this is, how to use it
├── PLAN.md                    # This file
├── cli/
│   ├── package.json
│   ├── src/
│   │   ├── index.js           # Entry: openclaw-usage analyze [options]
│   │   ├── parser.js          # Parse JSONL session files → usage records
│   │   ├── analyzer.js        # Aggregate: by model, by day, totals
│   │   ├── comparator.js      # What-if: same tokens on other providers
│   │   ├── renderer.js        # CLI output: tables, charts, colors
│   │   └── pricing.js         # Provider pricing data (April 2026)
│   └── README.md
├── web/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx + .css
│       ├── lib/
│       │   ├── parser.js      # Same logic as CLI (shared or duplicated)
│       │   ├── analyzer.js
│       │   └── pricing.js
│       └── components/
│           ├── FileUpload.jsx + .css    # Drop/select JSONL files
│           ├── Summary.jsx + .css       # Top-line numbers
│           ├── ModelBreakdown.jsx + .css # Table + pie chart
│           ├── DailyTrend.jsx + .css    # Bar chart over time
│           ├── Comparison.jsx + .css    # What-if table
│           └── CacheStats.jsx + .css    # Cache efficiency
└── docs/                      # Keep existing docs (reference)
```

---

## V1 Commands

### `openclaw-usage analyze` (primary)

```
Usage: openclaw-usage analyze [options]

Analyze your actual OpenClaw usage from session data.

Options:
  -p, --path <path>      Path to sessions dir (default: ~/.openclaw/agents/main/sessions)
  -d, --days <number>    Number of days to analyze (default: 30)
  -a, --agent <name>     Agent name (default: main)
  --all-agents           Analyze all agents
  --json                 Output as JSON
  --csv                  Export as CSV
  -v, --verbose          Show per-session breakdown
```

### `openclaw-usage compare` (secondary)

```
Usage: openclaw-usage compare [options]

Compare your actual usage costs against alternative providers.

Options:
  -p, --path <path>      Path to sessions dir
  -d, --days <number>    Days to analyze (default: 30)
  --model <model>        Compare against specific model
  --json                 Output as JSON
```

### `openclaw-usage export` (utility)

```
Usage: openclaw-usage export [options]

Export usage data as JSON or CSV for external analysis.

Options:
  -p, --path <path>      Path to sessions dir
  -d, --days <number>    Days to export
  -o, --output <file>    Output file (default: stdout)
  -f, --format <fmt>     Format: json, csv (default: json)
```

---

## V1 Web Dashboard

Instead of a calculator with hypothetical inputs, the web version:

1. **File Upload** — User drops their JSONL session files (or pastes a directory path)
2. **Auto-analyze** — Parse and display immediately
3. **Dashboard** — Summary, model breakdown, daily trends, comparison
4. **Privacy** — Everything runs client-side. No data leaves the browser.

### Key difference from current POC:
- Current: "Enter your estimated messages per day" → guess-based
- New: "Upload your actual session data" → fact-based

---

## Implementation Steps

### Step 1: Parser (`parser.js`)
- Read JSONL files from sessions directory
- Extract messages with `type: "message"` and `message.role: "assistant"`
- Pull: timestamp, provider, model, usage.input, usage.output, usage.cacheRead, usage.cacheWrite, usage.cost.total
- Handle edge cases: missing fields, partial records, non-assistant messages
- Filter by date range

### Step 2: Analyzer (`analyzer.js`)
- Aggregate by model: total messages, tokens, cost, % of spend
- Aggregate by day: daily cost, daily tokens
- Aggregate by session: cost per session
- Calculate cache efficiency: cacheRead / (input + cacheRead) ratio
- Calculate averages: per-day, per-message, projected monthly

### Step 3: Comparator (`comparator.js`)
- Take actual token usage per message
- Recalculate: "if this exact message was sent to Model X, what would it cost?"
- Use actual input/output token counts (not estimates)
- Calculate hybrid routing cost: classify by token count (large = complex, small = simple)
- Show savings per model

### Step 4: Renderer (`renderer.js`)
- CLI tables with chalk + cli-table3
- Sparkline-style daily trend using bar characters
- Color-coded savings (green = cheaper, red = more expensive)
- Summary card at top

### Step 5: Web Dashboard
- React components consuming same parser/analyzer logic
- File upload component (drag & drop JSONL files)
- Summary cards, bar charts, comparison table
- All client-side — no server needed
- Export button for JSON/CSV

---

## What Gets Cut (from current POC)

- ❌ `migrate` command (future feature: "switch modes")
- ❌ `rollback` command (future)
- ❌ `config` command (future)
- ❌ `upgrade` / Pro tier (future)
- ❌ Hypothetical calculator inputs (replaced with real data)
- ❌ Affiliate links, upsells, monetization UI (future)
- ❌ Budget alerts (future)
- ❌ All docs/ and research/ (keep for reference but not the product)

---

## What Stays

- ✅ Pricing data for all providers (pricing.js — already solid)
- ✅ Dark theme web UI (already looks good)
- ✅ CLI table rendering approach
- ✅ Project structure / build tooling

---

## Success Criteria (V1)

1. **Run `openclaw-usage analyze` on a real OpenClaw install → get accurate report** ← the only thing that matters
2. Output matches actual provider billing (within 5% tolerance)
3. Comparison shows realistic alternatives
4. Web version works with uploaded files
5. < 5 seconds to analyze 175 sessions

---

## Next Feature (V2): Switch Modes

After "understand usage" is sharp, the next feature is:
- Recommend optimal model for each query type
- One-command model switch in OpenClaw config
- A/B tracking: compare performance before/after switch
- "Smart mode" that auto-routes based on query complexity

**But that's V2. V1 is UNDERSTAND ONLY.**
