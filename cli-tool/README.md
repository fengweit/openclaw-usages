# openclaw-usage

CLI tool to analyze, optimize, and manage your OpenClaw AI provider costs.

Built in response to the April 2026 pricing changes affecting 250K+ developers.

## Install

```bash
npm install -g openclaw-usage
```

## Quick Start

```bash
# See how much you could save
openclaw-usage optimize

# Switch to a cheaper provider
openclaw-usage migrate

# Track your spending
openclaw-usage stats

# Set a budget alert
openclaw-usage config set budget.alert 50
```

## Commands

### `optimize`

Analyze your current usage and compare costs across all AI providers.

```bash
openclaw-usage optimize
openclaw-usage optimize --model claude-opus --daily 100 --tokens 2000
```

**Options:**
- `-m, --model <model>` — Current model (e.g., claude-opus, gpt-4o, gemini-pro)
- `-d, --daily <number>` — Messages per day
- `-t, --tokens <number>` — Average tokens per message

**Output:** Cost comparison table across 9 models from Anthropic, OpenAI, and Google with savings estimates and hybrid routing preview.

### `migrate`

Interactive migration wizard to switch providers safely.

```bash
openclaw-usage migrate
openclaw-usage migrate --target gpt-4o
openclaw-usage migrate --target gemini-pro --dry-run
```

**Options:**
- `-t, --target <provider>` — Target provider/model
- `--dry-run` — Preview without making changes

**Process:**
1. Detects your current OpenClaw config
2. Shows available providers with pricing
3. Creates automatic backup
4. Writes new configuration
5. Validates the result

### `stats`

View usage statistics and cost tracking dashboard.

```bash
openclaw-usage stats
openclaw-usage stats --period daily
openclaw-usage stats --period monthly --json
```

**Options:**
- `-p, --period <period>` — Time period: daily, weekly, monthly (default: weekly)
- `--json` — Output as JSON

**Shows:** Cost trends, model usage breakdown, budget status, and projected monthly spend.

### `rollback`

Rollback to a previous provider configuration.

```bash
openclaw-usage rollback
openclaw-usage rollback --list
```

**Options:**
- `-l, --list` — List available backups without restoring

### `config`

View and manage settings.

```bash
openclaw-usage config              # Show all settings
openclaw-usage config show         # Same as above
openclaw-usage config set budget.alert 150
openclaw-usage config set tracking.enabled true
openclaw-usage config reset        # Reset all to defaults
openclaw-usage config reset budget.alert  # Reset one key
```

**Available keys:**

| Key | Default | Description |
|-----|---------|-------------|
| `budget.alert` | 100 | Monthly budget alert threshold (USD) |
| `budget.hard-limit` | 0 | Hard spending limit (0 = disabled) |
| `tracking.enabled` | true | Enable cost tracking |
| `tracking.retention-days` | 90 | Days to keep tracking data |
| `default.provider` | anthropic | Default provider |
| `default.model` | claude-sonnet | Default model |
| `notifications.enabled` | true | Enable notifications |
| `notifications.email` | — | Email for alerts |
| `hybrid.budget-model` | gemini-flash | Budget model (Pro) |
| `hybrid.premium-model` | claude-sonnet | Premium model (Pro) |
| `hybrid.threshold` | 0.5 | Routing threshold (Pro) |

### `upgrade`

Upgrade to Pro tier for advanced features.

```bash
openclaw-usage upgrade
openclaw-usage upgrade --key ABCD-1234-EFGH-5678
```

**Options:**
- `-k, --key <license>` — Activate with license key

## Pricing Tiers

### Free
- ✅ Cost analysis & comparison
- ✅ Single-provider migration
- ✅ Configuration rollback
- ✅ 7-day cost tracking
- ✅ Basic settings

### Pro ($9/month)
- ✅ Everything in Free
- ✅ Hybrid multi-provider routing
- ✅ Unlimited cost tracking
- ✅ Custom routing rules
- ✅ Budget alerts & notifications
- ✅ Advanced analytics
- ✅ Export reports (CSV/PDF)
- ✅ Priority support

**Purchase:** [openclaw-usage.gumroad.com/l/pro](https://openclaw-usage.gumroad.com/l/pro)

## Supported Providers

| Provider | Model | Input ($/M) | Output ($/M) | Tier |
|----------|-------|-------------|--------------|------|
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

MIT — built by [Rist (Fengwei Tian)](https://github.com/fengweit)
