# OpenClaw Usage Analyzer — Product Plan

## The Real Problem (Fei's experience, Apr 4 2026)

**$11.29 spent in ~2 hours. 100% Claude Opus. 112 messages.**

The data tells the story:
- **Cache is saving 92%** — without it, today would cost $151.51
- **Top 10 messages = 43% of total cost** — a few expensive turns dominate
- **12pm hour: $9.15** — 76 messages, mostly cache writes (new context)
- **Median message: $0.07** — most messages are cheap, but the expensive ones hurt
- **What-if Gemini Flash: $0.75** (93% savings) vs **Haiku: $2.53** (78% savings)

OpenClaw's dashboard already shows basic usage stats. **We build on top of that with actionable intelligence.**

---

## Product Vision: 3 Phases

### Phase 1: UNDERSTAND (Current Build — V1)
> "Where is my money going?"

Parse real session data → show cost breakdown, distribution, what-if comparisons.
**This is the free hook that gets people in the door.**

### Phase 2: SWITCH (Next — V2)  
> "Switch to the right model for each task"

One-click model switching per session, smart routing recommendations, A/B cost tracking.
**This is the Pro feature that saves real money.**

### Phase 3: OPTIMIZE (Future — V3)
> "Detect waste and fix it automatically"

Prompt analysis (detect verbose/redundant context), auto-compact suggestions, smart caching strategies.
**This is the premium tier — the silver bullet.**

---

## Phase 1: UNDERSTAND (V1 — Build Now)

### What the existing OpenClaw dashboard has:
- Date range filters
- Tokens vs Cost toggle  
- Activity by Time timeline
- Daily Usage chart
- Sessions list with token counts
- Export

### What's MISSING (our value-add):

#### 1. Cost Distribution Intelligence
- **Per-message cost histogram** — see that top 10 messages = 43% of spend
- **Expensive message spotlight** — what were those $0.85 messages doing?
- **Hourly cost heatmap** — see spending spikes in real-time
- **Cache efficiency score** — "cache saved you 92% today" with trend

#### 2. What-If Model Comparison  
- **Same usage, different models** — actual token counts repriced on every provider
- **Quality-adjusted comparison** — "Sonnet at $30/day gets you 90% of Opus quality"
- **Hybrid routing simulation** — "route simple queries to Haiku, complex to Opus = $4/day"
- **Monthly projection** — "$11/day × 30 = $340/mo on Opus vs $23/mo hybrid"

#### 3. Session-Level Drill-Down
- **Per-session cost ranking** — which sessions cost the most?
- **Context growth curve** — see cache writes grow per session (the real cost driver)
- **Optimal session length** — "sessions over 50 messages cost 3x due to context growth"
- **Session comparison** — side-by-side cost/efficiency of different sessions

---

## V1 Feature Spec

### CLI: `openclaw-usage analyze`

```
$ openclaw-usage analyze

⚡ OpenClaw Usage Report — Apr 4, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 TODAY: $11.29 across 112 messages (1 session)
   Without cache: $151.51 — cache saving you 92%
   Projected monthly: $339/month at this rate

🤖 MODEL MIX
   claude-opus-4-6: 100% of spend ($11.29)

📊 COST DISTRIBUTION
   Top 10 messages (9%): $4.91 (43% of total spend)
   Median message: $0.07
   Average message: $0.10
   → Most messages are cheap. A few expensive context-heavy turns dominate.

⏰ HOURLY SPEND
   04:00 █            $0.13
   11:00 ████         $2.18
   12:00 ██████████   $9.15 ← peak

💡 WHAT-IF: Same tokens on other models
┌─────────────────────┬──────────┬──────────┬──────────┐
│ Model               │ Cost     │ Savings  │ Quality  │
├─────────────────────┼──────────┼──────────┼──────────┤
│ Opus 4 (current)    │ $11.29   │ —        │ ★★★★★    │
│ Sonnet 4            │ $1.85*   │ $9.44    │ ★★★★     │
│ GPT-4o              │ $1.53*   │ $9.76    │ ★★★★     │
│ Gemini 2.5 Pro      │ $0.77*   │ $10.52   │ ★★★★     │
│ Haiku 3.5           │ $0.15*   │ $11.14   │ ★★★      │
│ Gemini Flash        │ $0.05*   │ $11.24   │ ★★★      │
│ Hybrid (smart)      │ $0.52*   │ $10.77   │ ★★★★     │
└─────────────────────┴──────────┴──────────┴──────────┘
* Estimated with equivalent cache ratios

🎯 RECOMMENDATION
   You're on Opus for everything. Consider:
   → Switch to Sonnet for routine tasks: save ~$7/day ($210/mo)
   → Use hybrid routing: save ~$10/day ($300/mo)
   → Keep Opus only for complex analysis: ~5% of messages
```

### Web Dashboard (port 5055)

**Page 1: Overview**
- Big number: today's spend + trend
- Donut chart: model mix
- Line chart: daily cost over time
- Cache efficiency gauge

**Page 2: Cost Analysis**
- Message cost histogram (most messages are cheap, long tail of expensive ones)
- Hourly heatmap
- Session cost ranking table
- Context growth curve per session

**Page 3: What-If Comparison**
- Interactive: select any model → see recalculated cost
- Side-by-side: your actual vs alternative
- Hybrid routing simulator: drag slider for simple/complex split
- Monthly projection at each option

**Page 4: Session Detail**
- Click any session → see per-message cost timeline
- Identify the expensive turns
- Show what model would be cheapest for each message
- Context window growth visualization

---

## V1 Tech Implementation

### Data Source
OpenClaw session JSONL files at `~/.openclaw/agents/*/sessions/*.jsonl`

Each assistant message contains:
```json
{
  "usage": {
    "input": 3,
    "output": 142,
    "cacheRead": 8841973,
    "cacheWrite": 859036,
    "totalTokens": 23475,
    "cost": {
      "input": 0.000015,
      "output": 0.00355,
      "cacheRead": 0,
      "cacheWrite": 0.14581,
      "total": 0.14937
    }
  }
}
```

### File Structure (V1)
```
openclaw-usages/
├── README.md
├── PLAN.md
├── cli/
│   ├── package.json
│   └── src/
│       ├── index.js          # Entry: analyze, compare, export
│       ├── parser.js         # Parse JSONL → usage records
│       ├── analyzer.js       # Aggregate by model/day/session/hour
│       ├── comparator.js     # What-if repricing on other models
│       ├── renderer.js       # CLI tables + charts
│       └── pricing.js        # Provider pricing data
├── web/
│   ├── package.json
│   ├── vite.config.js        # Port 5055
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── lib/
│       │   ├── parser.js     # Same parsing logic
│       │   ├── analyzer.js
│       │   ├── comparator.js
│       │   └── pricing.js
│       └── pages/
│           ├── Overview.jsx      # Top-line + trends
│           ├── CostAnalysis.jsx  # Distribution + heatmap
│           ├── Comparison.jsx    # What-if models
│           └── SessionDetail.jsx # Per-session drill-down
└── docs/                     # Keep existing
```

### Key Metrics to Surface

| Metric | What it tells you | Why it matters |
|--------|------------------|---------------|
| Total daily cost | Am I overspending? | Budget awareness |
| Cache efficiency % | How much caching saves | Architecture decision |
| Top N messages % of cost | Are a few turns expensive? | Identify optimization targets |
| Model mix | Am I using the right models? | Switch recommendation |
| Context growth rate | How fast does cost grow per session? | Session length optimization |
| Cost per useful output token | Efficiency ratio | Compare models fairly |
| Projected monthly | What's my trajectory? | Financial planning |

---

## Phase 2: SWITCH (V2 — After V1 ships)

### Features
- **Model selector per session** — one click to switch from Opus to Sonnet
- **Smart routing rules** — "use Opus for code review, Sonnet for chat, Haiku for reformatting"
- **A/B tracking** — run same workload on two models, compare cost + quality
- **Session templates** — preset configs for different task types
- **Budget limits** — "stop me at $5/day" with model downgrade fallback

### Revenue
- Pro tier: $9/month
- Unlocks: smart routing, A/B tracking, budget automation, unlimited history

---

## Phase 3: OPTIMIZE (V3 — Future)

### Features
- **Prompt waste detection** — "this prompt sends 50K tokens of context but only uses 2K"
- **Auto-compact suggestions** — "summarize this context to save 80% of tokens"
- **Redundancy alerts** — "you're sending the same file content 15 times in this session"
- **Caching strategy advisor** — "restructure prompts to maximize cache hits"
- **Token budget per message** — enforce limits on verbose outputs

### Revenue
- Premium tier: $29/month
- Unlocks: prompt analysis, auto-optimization, token budgets, API access

---

## Success Metrics

### V1 (Understand)
- Accurate cost reporting matching actual provider bills (±5%)
- < 3 seconds to analyze 200 sessions
- Users say "I didn't know X was costing me Y"
- 500 installs in first month

### V2 (Switch)
- Average user saves 40%+ on monthly cost
- 10% free→Pro conversion
- $900 MRR from 100 Pro users

### V3 (Optimize)
- Additional 20% savings on top of model switching
- 5% Pro→Premium conversion
- $6,500 MRR combined
