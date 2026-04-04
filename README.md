# OpenClaw Usage Analyzer

Understand exactly how you're using OpenClaw — real data, not guesswork.

**Status:** POC with auth system · Ready for Supabase connection  
**Local:** `http://localhost:5055`  
**Repo:** [github.com/fengweit/openclaw-usages](https://github.com/fengweit/openclaw-usages)

---

## Quick Start

```bash
cd web-calculator
npm install
cp .env.example .env   # Add your Supabase credentials
npm run dev             # http://localhost:5055
```

---

## What's Working Now

### 🌐 Web App (port 5055)

**Pages:**

| Route | What it does |
|-------|-------------|
| `/` | Landing page — hero, features, stats, waitlist email capture |
| `/signup` | Create account — GitHub OAuth, Google OAuth, or email/password |
| `/login` | Sign in — password or magic link, plus OAuth |
| `/auth/callback` | Handles OAuth/magic link redirects |
| `/dashboard` | Protected — cost calculator (requires login) |

**Auth features:**
- GitHub OAuth login/signup
- Google OAuth login/signup
- Email + password signup/login
- Magic link (passwordless) login
- Auto profile creation on signup
- Protected dashboard route
- Session persistence

**Calculator features (on dashboard):**
- Interactive messages/day slider (5–500)
- Message length toggle (short ~500 / medium ~2K / long ~5K tokens)
- Use case selector (coding, chat, analysis, creative)
- Current provider dropdown (9 models)
- Real-time cost comparison bar chart
- Provider cards with quality scores + savings %
- Hybrid routing preview (Pro upsell)

**Landing page:**
- Gradient hero with real stats (92% cache savings, $340→$16 hybrid)
- 6 feature cards (3 free, 3 coming soon)
- Email waitlist capture (writes to Supabase `waitlist` table)
- CTA → signup flow

### 💻 CLI Tool

```bash
cd cli-tool && npm install
node src/index.js optimize    # Compare costs across providers
node src/index.js migrate     # Interactive migration wizard
node src/index.js stats       # Usage dashboard (demo data)
node src/index.js config      # View/edit settings
node src/index.js rollback    # Restore previous config
node src/index.js upgrade     # Pro tier flow
```

---

## Setup: Supabase (Required for Auth)

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New Project

### 2. Run the schema

Go to SQL Editor in your Supabase dashboard. Paste and run:

```
supabase/schema.sql
```

This creates:
- `profiles` table (auto-created on signup via trigger)
- `waitlist` table (email collection from landing page)
- `usage_snapshots` table (for future usage data sync)
- Row Level Security policies
- Indexes

### 3. Enable OAuth providers

In Supabase Dashboard → Authentication → Providers:

**GitHub:**
1. Go to [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App
2. Set callback URL: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
3. Copy Client ID + Secret → paste into Supabase GitHub provider settings

**Google:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com) → Credentials → OAuth 2.0
2. Set authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
3. Copy Client ID + Secret → paste into Supabase Google provider settings

### 4. Add environment variables

```bash
cp web-calculator/.env.example web-calculator/.env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
VITE_APP_URL=http://localhost:5055
```

Find these in Supabase Dashboard → Settings → API.

### 5. Test locally

```bash
cd web-calculator && npm run dev
```

Go to `http://localhost:5055/signup` → create an account → should land on dashboard.

---

## Deploy to Vercel

```bash
cd web-calculator

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_APP_URL

# Deploy production
vercel --prod
```

The `vercel.json` is already configured with SPA rewrites and security headers.

After deploying, update:
1. Supabase → Authentication → URL Configuration → Site URL = your Vercel URL
2. Supabase → Authentication → URL Configuration → Redirect URLs → add your Vercel URL
3. OAuth provider callback URLs (GitHub, Google) → add Vercel URL

---

## Database Schema

```
profiles
├── id (UUID, from auth.users)
├── email
├── full_name
├── plan (free/pro/premium)
├── stripe_customer_id
├── notification_prefs (JSONB)
├── created_at
└── updated_at

waitlist
├── id (UUID)
├── email (unique)
├── source (landing/cli/calculator)
├── features (text[])
└── created_at

usage_snapshots
├── id (UUID)
├── user_id (→ profiles)
├── period_start, period_end
├── total_cost, total_messages
├── total_input/output/cache tokens
├── model_breakdown (JSONB)
├── daily_costs (JSONB)
└── created_at
```

---

## Project Structure

```
openclaw-usages/
├── README.md               ← You are here
├── PLAN.md                 ← Product roadmap (3 phases)
├── supabase/
│   └── schema.sql          ← Run in Supabase SQL Editor
├── web-calculator/
│   ├── package.json
│   ├── vite.config.js      ← Port 5055
│   ├── vercel.json         ← Vercel deployment config
│   ├── index.html
│   ├── .env.example        ← Copy to .env, add Supabase keys
│   └── src/
│       ├── main.jsx
│       ├── App.jsx          ← Router + AuthProvider
│       ├── App.css
│       ├── lib/
│       │   ├── supabase.js  ← Supabase client
│       │   ├── auth.jsx     ← AuthContext + hooks
│       │   └── calculator.js← Pricing logic
│       ├── pages/
│       │   ├── Landing.jsx + .css   ← Public landing page
│       │   ├── Login.jsx            ← Sign in (OAuth + email)
│       │   ├── Signup.jsx           ← Create account
│       │   ├── AuthCallback.jsx     ← OAuth redirect handler
│       │   ├── Dashboard.jsx + .css ← Protected calculator
│       │   └── Auth.css             ← Shared auth styles
│       └── components/
│           ├── Calculator.jsx + .css
│           ├── Results.jsx + .css
│           ├── ProviderCard.jsx + .css
│           └── CostChart.jsx + .css
├── cli-tool/               ← CLI tool (existing)
├── docs/                   ← Project documentation
└── research/               ← Market research
```

---

## Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Landing page + auth | ✅ Done |
| 1 | Cost calculator | ✅ Done |
| 1 | Waitlist capture | ✅ Done |
| 1 | Supabase schema | ✅ Done |
| 1 | Vercel deploy config | ✅ Done |
| 1 | Real usage data parser | 🔜 Next |
| 2 | Smart model switching | 📋 Planned |
| 2 | Stripe payments (Pro $9/mo) | 📋 Planned |
| 3 | Prompt optimization | 📋 Planned |
| 3 | Cost alerts via email | 📋 Planned |

---

## License

MIT — [Fengwei Tian](https://github.com/fengweit)
