# 03 — Product Specifications

## Part A: CLI Tool (`openclaw-usage`)

### Overview
A Node.js command-line tool that helps OpenClaw users analyze costs, compare providers, migrate configs, and optimize spending. Written in CommonJS for broad compatibility.

---

### Installation
```bash
npm install -g openclaw-usage
```

### Commands

#### `openclaw-usage optimize`
Interactive cost analysis and comparison.

**Flow:**
1. Prompt: "What's your current provider?" → dropdown (Claude, GPT-4, Gemini)
2. Prompt: "Which model?" → dropdown filtered by provider
3. Prompt: "Messages per day?" → number input
4. Prompt: "Average tokens per message?" → slider (500/1000/2000/4000)
5. Calculate costs across all providers
6. Display comparison table with:
   - Monthly cost per provider/model
   - Savings vs current selection
   - Quality rating (★☆☆ to ★★★)
   - Recommendation badge ("CHEAPEST", "BEST VALUE", "PREMIUM")

**Output Format:**
```
╔══════════════════╤═══════════╤══════════╤═════════╤═══════════════╗
║ Provider / Model │ $/Month   │ Savings  │ Quality │ Recommendation║
╠══════════════════╪═══════════╪══════════╪═════════╪═══════════════╣
║ Gemini Flash-8B  │ $2.85     │ $447.15  │ ★★☆     │ 💰 CHEAPEST  ║
║ Gemini Flash     │ $5.63     │ $444.38  │ ★★★     │ ⭐ BEST VALUE║
║ GPT-4o-mini      │ $11.25    │ $438.75  │ ★★★     │              ║
║ Claude Haiku     │ $22.50    │ $427.50  │ ★★★     │              ║
║ Gemini Pro       │ $93.75    │ $356.25  │ ★★★     │              ║
║ Claude Sonnet    │ $270.00   │ $180.00  │ ★★★     │              ║
║ Claude Opus      │ $450.00   │ YOU      │ ★★★     │ 👑 PREMIUM   ║
╚══════════════════╧═══════════╧══════════╧═════════╧═══════════════╝
```

**Flags:**
- `--json` — Output as JSON
- `--model <name>` — Skip interactive, use specified model
- `--usage <tokens>` — Skip interactive, use specified monthly tokens
- `--no-color` — Disable colored output

---

#### `openclaw-usage migrate`
Provider migration wizard.

**Flow:**
1. Detect current OpenClaw config (check `~/.openclaw/config.yaml`, `./openclaw.yaml`, env vars)
2. Display current config summary
3. Show available target providers with pricing
4. Prompt: "Which provider do you want to migrate to?"
5. Prompt: "Which model?"
6. Create backup of current config → `~/.openclaw/backups/<timestamp>.yaml`
7. Generate new config for target provider
8. Prompt: "Apply changes? (y/n)"
9. Write new config
10. Validate by testing connection
11. Show success/failure with rollback instructions

**Flags:**
- `--provider <name>` — Skip interactive provider selection
- `--model <name>` — Skip interactive model selection
- `--dry-run` — Show what would change without applying
- `--no-backup` — Skip backup step (not recommended)
- `--config <path>` — Custom config file path

---

#### `openclaw-usage stats`
Usage statistics dashboard.

**Data Source:** Local store via `Conf` package (`~/.config/openclaw-usage/config.json`)

**Display Sections:**
1. **Today** — Requests, tokens, cost
2. **This Week** — Daily breakdown table
3. **This Month** — Weekly breakdown + total
4. **Top Models** — Usage distribution pie (ASCII)
5. **Cost Trend** — Sparkline showing daily costs

**Flags:**
- `--period <day|week|month|all>` — Filter time period
- `--json` — JSON output
- `--export <path>` — Export to CSV

---

#### `openclaw-usage rollback`
Restore a previous configuration.

**Flow:**
1. List available backups from `~/.openclaw/backups/`
2. Show date, provider, and model for each backup
3. Prompt: "Which backup to restore?"
4. Backup current config (safety net)
5. Restore selected backup
6. Validate connection

**Flags:**
- `--latest` — Restore most recent backup without prompting
- `--list` — Just list backups, don't restore

---

#### `openclaw-usage config`
Manage tool settings.

**Subcommands:**
- `config show` — Display all settings
- `config set <key> <value>` — Set a setting
- `config reset` — Reset to defaults
- `config get <key>` — Get a single setting

**Available Settings:**
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `budget.monthly` | number | 0 (disabled) | Monthly budget alert threshold ($) |
| `budget.daily` | number | 0 (disabled) | Daily budget alert threshold ($) |
| `tracking.enabled` | boolean | true | Enable usage tracking |
| `tracking.retention` | number | 7 | Days to retain tracking data (Pro: unlimited) |
| `provider.default` | string | "" | Default provider for commands |
| `license.key` | string | "" | Pro license key |
| `output.format` | string | "table" | Default output format (table/json) |
| `output.color` | boolean | true | Enable colored output |

---

#### `openclaw-usage upgrade`
Pro tier management.

**Display:**
```
╔═══════════════════════╤═════════╤═════════╗
║ Feature               │ Free    │ Pro $9  ║
╠═══════════════════════╪═════════╪═════════╣
║ Cost Analysis         │ ✅      │ ✅      ║
║ Single Migration      │ ✅      │ ✅      ║
║ Usage Tracking        │ 7 days  │ ∞       ║
║ Hybrid Routing        │ ❌      │ ✅      ║
║ Budget Alerts         │ Monthly │ Custom  ║
║ Export Data           │ ❌      │ ✅      ║
║ Auto-Optimization     │ ❌      │ ✅      ║
║ Priority Support      │ ❌      │ ✅      ║
╚═══════════════════════╧═════════╧═════════╝
```

**Flow:**
1. Show comparison table
2. Prompt: "Enter license key or visit https://openclaw-usage.dev/pro"
3. Validate license key
4. Enable Pro features

---

### Config File Structure
```yaml
# ~/.openclaw/config.yaml (detected by migrate command)
provider: anthropic
model: claude-sonnet-4-20250514
api_key: sk-ant-...
endpoint: https://api.anthropic.com
options:
  max_tokens: 4096
  temperature: 0.7
  retry:
    max_attempts: 3
    backoff_ms: 1000
```

### Local Data Store
```json
// ~/.config/openclaw-usage/config.json (managed by Conf)
{
  "budget": { "monthly": 100, "daily": 10 },
  "tracking": { "enabled": true, "retention": 7 },
  "provider": { "default": "anthropic" },
  "license": { "key": "", "valid": false },
  "usage": {
    "2026-04-04": {
      "requests": 142,
      "input_tokens": 284000,
      "output_tokens": 71000,
      "cost": 4.28,
      "models": { "claude-sonnet-4-20250514": 100, "claude-haiku": 42 }
    }
  }
}
```

---

## Part B: Web Calculator

### Overview
A React + Vite single-page application that lets users estimate and compare AI provider costs. Dark theme, responsive, no login required. Monetized via affiliate links and premium report upsells.

---

### Components

#### `App.jsx`
- Dark theme shell
- Header with logo and tagline: "Stop Overpaying for AI"
- Navigation: Calculator | About | CLI Tool
- Footer with links

#### `Calculator.jsx`
Input form with real-time updates:
- **Monthly Messages** — Range slider, 100–10,000, default 1,000
- **Average Message Length** — Radio: Short (500 tokens), Medium (1,500 tokens), Long (4,000 tokens)
- **Use Case** — Dropdown: Coding, Chat, Analysis, Creative Writing
- **Current Provider** — Dropdown: Claude Opus, Claude Sonnet, Claude Haiku, GPT-4o, GPT-4o-mini, GPT-4-turbo, Gemini Pro, Gemini Flash, Gemini Flash-8B, None

Auto-calculates on every change. No submit button.

#### `Results.jsx`
Results panel showing:
- Current monthly cost (if provider selected)
- All providers ranked by cost
- Savings vs current provider
- Recommended provider based on use case + budget
- "Get the CLI tool for automated optimization" CTA

#### `ProviderCard.jsx`
Individual card for each provider:
- Provider logo/icon area
- Model name
- Monthly cost (large, prominent)
- Quality score for selected use case (1-5 stars)
- Badge: "CHEAPEST", "RECOMMENDED", "PREMIUM", or none
- Affiliate link button: "Try [Provider]"

#### `CostChart.jsx`
Horizontal bar chart (pure CSS):
- One bar per provider, sorted by cost
- Bar width proportional to cost (cheapest = shortest)
- Color-coded: green (cheap), yellow (mid), red (expensive)
- Cost label at end of each bar
- Current provider highlighted with border

---

### Calculations

#### Token Estimation
```
inputTokensPerMessage = messageLength × 0.6  (60% of message is input/prompt)
outputTokensPerMessage = messageLength × 0.4  (40% is output/response)
monthlyInputTokens = messagesPerDay × 30 × inputTokensPerMessage
monthlyOutputTokens = messagesPerDay × 30 × outputTokensPerMessage
```

#### Cost Calculation
```
monthlyCost = (monthlyInputTokens / 1,000,000 × inputPricePerM) +
              (monthlyOutputTokens / 1,000,000 × outputPricePerM)
```

#### Quality Scores (1-5, by use case)
| Model | Coding | Chat | Analysis | Creative |
|-------|--------|------|----------|----------|
| Claude Opus | 5 | 5 | 5 | 5 |
| Claude Sonnet | 5 | 4 | 4 | 4 |
| Claude Haiku | 3 | 4 | 3 | 3 |
| GPT-4o | 4 | 5 | 4 | 4 |
| GPT-4o-mini | 3 | 4 | 3 | 3 |
| GPT-4-turbo | 4 | 4 | 5 | 4 |
| Gemini Pro | 4 | 4 | 4 | 3 |
| Gemini Flash | 3 | 3 | 3 | 2 |
| Gemini Flash-8B | 2 | 2 | 2 | 1 |

#### Recommendation Logic
```
if (qualityScore >= 4 && cost <= median): "RECOMMENDED"
if (cost === min): "CHEAPEST"  
if (qualityScore === 5 && cost === max): "PREMIUM"
```

---

### Responsive Design
- **Desktop (>1024px):** Calculator left, Results right (2-column)
- **Tablet (768-1024px):** Single column, calculator above results
- **Mobile (<768px):** Single column, compact cards, smaller chart

### Color Palette (Dark Theme)
```css
--bg-primary: #0a0a0f;
--bg-secondary: #12121a;
--bg-card: #1a1a2e;
--text-primary: #e0e0e0;
--text-secondary: #a0a0b0;
--accent-green: #00d4aa;
--accent-yellow: #ffd700;
--accent-red: #ff4757;
--accent-blue: #4a9eff;
--border: #2a2a3e;
```

---

### Deployment
- **Build:** `npm run build` → static files in `dist/`
- **Host:** Vercel (free tier) or Netlify
- **Domain:** TBD (e.g., `openclaw-calculator.dev`)
- **Analytics:** Plausible or Simple Analytics (privacy-friendly)

---

*Specifications defined April 5, 2026. Subject to iteration during build week.*
