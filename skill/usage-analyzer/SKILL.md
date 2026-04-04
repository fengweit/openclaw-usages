---
name: usage-analyzer
description: Analyze OpenClaw usage costs, token consumption, and model efficiency. Use when a user asks about their AI spending, costs, usage stats, token counts, model comparison, or wants to optimize their AI budget. Triggers on keywords like "usage", "cost", "spending", "how much", "tokens", "expensive", "budget", "save money", "model comparison", "what-if".
---

# Usage Analyzer

Analyze OpenClaw session data to show cost breakdowns, model comparisons, and optimization recommendations.

## Quick Start

Run the analyzer script to generate a cost report:

```bash
python3 scripts/analyze.py
```

Options:
- `--days N` — analyze last N days only (default: all time)
- `--json` — output as JSON (for programmatic use)
- `--top N` — number of top messages to include (default: 20)

## When the User Asks for Usage / Costs

1. Run `python3 scripts/analyze.py --days 7` (or the requested period)
2. Send the text output directly — it's already formatted for chat
3. For today only, use `--days 1`
4. For a custom period, adjust `--days` accordingly

## When the User Asks "How Can I Save Money?"

1. Run the analyzer with `--days 30` (or their billing period)
2. Focus on the WHAT-IF section — it shows exact savings per model
3. Highlight the top recommendation (usually: use Sonnet for routine, Opus for complex)
4. Mention the Top Sessions — those are where the biggest optimization opportunity lives

## When Sending to Chat (Telegram/Discord/etc.)

The script output uses Unicode box drawing and emoji — it renders well on all platforms.
For very long reports, summarize the key numbers instead of pasting the full output.

Key metrics to always surface:
- Total spend + daily average
- Cache savings percentage
- Model mix (what % is Opus vs cheaper models)
- What-if: potential savings with model switching
- Top recommendation

## Data Source

The script reads `~/.openclaw/agents/*/sessions/*.jsonl` files.
Each assistant message contains a `usage.cost` object with per-token cost breakdown.
No external API calls — everything is local file parsing.
