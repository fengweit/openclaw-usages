# 04 — Revenue Model

## Overview

Five revenue streams, ordered by time-to-revenue:

1. **Affiliate Commissions** — Immediate, scales with traffic
2. **Pro Subscriptions** — $9/mo MRR, core business
3. **Premium Reports** — $9 one-time, impulse buy
4. **Gateway Proxy** — $29-49/mo, high-value segment
5. **Consulting** — $200/hr, enterprise

---

## Stream 1: Affiliate Commissions

### How It Works
When users discover a cheaper provider through our calculator or CLI, we link them to sign up via affiliate/referral programs. Most AI providers offer affiliate or referral credits.

### Expected Commissions
| Provider | Program | Est. Commission |
|----------|---------|-----------------|
| Anthropic | Partner program | $5-10 per signup |
| OpenAI | API referral | $5 credit (indirect) |
| Google Cloud | Cloud partner | $50-200 per qualified lead |
| Together AI | Affiliate | 10% first 3 months |
| Groq | Early partner | Negotiable |

### Projections
- **Week 1:** 50 signups × $7 avg = **$350**
- **Month 1:** 500 signups × $10 avg = **$5,000**
- **Month 3:** 2,000 signups × $12 avg = **$24,000**

### Implementation
- Web calculator: "Try [Provider]" buttons with affiliate links
- CLI tool: post-optimization recommendation with referral URL
- Landing page: provider comparison table with affiliate CTAs

---

## Stream 2: Pro Subscriptions ($9/month)

### Free vs Pro Feature Matrix

| Feature | Free | Pro ($9/mo) |
|---------|------|-------------|
| Cost analysis | ✅ Basic | ✅ Advanced + history |
| Single migration | ✅ | ✅ |
| Multi-provider routing | ❌ | ✅ |
| Usage tracking | 7 days | Unlimited |
| Budget alerts | Monthly only | Custom (daily/weekly/real-time) |
| Data export (CSV/JSON) | ❌ | ✅ |
| Auto-optimization suggestions | ❌ | ✅ Weekly digest |
| Rollback history | Last 3 | Unlimited |
| Priority support | ❌ | ✅ Email + Discord |

### Pricing Psychology
- $9/mo when users are paying $50-500/mo for AI = trivial
- Tool saves $50-300/mo → 5-30x ROI
- No annual commitment, cancel anytime
- First 14 days free (trial with full features)

### Conversion Funnel
```
Web Calculator visit (10,000/mo)
  → CLI download (2,000/mo, 20%)
    → Active free user (800/mo, 40%)
      → Pro trial (200/mo, 25%)
        → Paid conversion (100/mo, 50%)
```

### Projections
- **Month 1:** 100 subscribers × $9 = **$900 MRR**
- **Month 3:** 500 subscribers × $9 = **$4,500 MRR**
- **Month 6:** 1,500 subscribers × $9 = **$13,500 MRR**
- **Month 12:** 3,000 subscribers × $9 = **$27,000 MRR**

### Churn Assumptions
- Monthly churn: 8-12% (typical for dev tools)
- Net revenue retention: 90%+ (some users upgrade to Gateway)

---

## Stream 3: Premium Reports ($9 one-time)

### What's Included
A personalized PDF report containing:
1. **Current Cost Breakdown** — Detailed analysis of spending by model, time, endpoint
2. **Optimization Map** — Specific recommendations: "Move X queries from Opus to Haiku, save $Y/month"
3. **Migration Plan** — Step-by-step guide for the recommended switch
4. **12-Month Projection** — Estimated savings over time with recommended changes
5. **Risk Assessment** — Quality impact analysis for each recommendation

### Delivery
- Generated from CLI: `openclaw-usage report --premium`
- Generated from web: "Download Full Report" button
- Payment: Stripe checkout (web) or license key (CLI)

### Pricing Psychology
- $9 is an impulse buy for developers
- Report shows $100-500/mo in savings → massive perceived value
- One-time purchase → low friction, no commitment anxiety

### Projections
- **Month 1:** 200 reports × $9 = **$1,800**
- **Month 3:** 500 reports/mo × $9 = **$4,500/mo**
- **Month 6:** 300 reports/mo × $9 = **$2,700/mo** (declining as Pro absorbs)

---

## Stream 4: Gateway Proxy ($29-49/month)

### What It Is
A managed proxy service that sits between the user's app and AI providers:
- Automatic request routing based on complexity
- Cost optimization in real-time
- Failover between providers (if one is down, route to another)
- Detailed analytics and logging
- Single API endpoint, multiple providers behind it

### Tiers
| Feature | Starter ($29/mo) | Team ($49/mo) |
|---------|-------------------|---------------|
| Requests/month | 100K | 500K |
| Providers | 2 | Unlimited |
| Team members | 1 | 5 |
| Custom routing rules | 3 | Unlimited |
| SLA | Best effort | 99.5% uptime |
| Support | Email | Priority email + Slack |

### Implementation Timeline
- **Week 1-2:** Not available (focus on CLI + calculator)
- **Week 3-4:** Alpha with select users
- **Month 2:** Public launch

### Projections
- **Month 2:** 20 users × $35 avg = **$700 MRR**
- **Month 3:** 50 users × $39 avg = **$1,950 MRR**
- **Month 6:** 200 users × $39 avg = **$7,800 MRR**
- **Month 12:** 500 users × $42 avg = **$21,000 MRR**

---

## Stream 5: Consulting ($200/hour)

### Services
- **Migration Architecture** — Design multi-provider strategy for complex setups
- **Cost Audit** — Deep analysis of AI spending with optimization plan
- **Custom Routing** — Build custom routing rules for specific use cases
- **Integration Support** — Help teams integrate our tools into their workflow

### Target Clients
- Startups spending $500+/mo on AI (can't afford to waste time on DIY)
- Enterprises with complex multi-provider needs
- Teams migrating from OpenClaw to hybrid setups

### Engagement Model
- Minimum 2-hour engagement ($400)
- Typical engagement: 5-10 hours ($1,000-2,000)
- Monthly retainer available: $1,500/mo (8 hours)

### Projections
- **Month 1:** 5 hours × $200 = **$1,000**
- **Month 3:** 20 hours/mo × $200 = **$4,000/mo**
- **Month 6:** 40 hours/mo × $200 = **$8,000/mo**

---

## Combined Revenue Projections

### Month 1
| Stream | Revenue |
|--------|---------|
| Affiliates | $5,000 |
| Pro subscriptions | $900 MRR |
| Premium reports | $1,800 |
| Gateway proxy | $0 (not launched) |
| Consulting | $1,000 |
| **Total** | **$8,700** |

### Month 3
| Stream | Revenue |
|--------|---------|
| Affiliates | $24,000 (cumulative) |
| Pro subscriptions | $4,500 MRR |
| Premium reports | $4,500/mo |
| Gateway proxy | $1,950 MRR |
| Consulting | $4,000/mo |
| **Total MRR** | **$6,450** |
| **Total Month 3** | **$14,950** |

### Month 6
| Stream | Revenue |
|--------|---------|
| Pro subscriptions | $13,500 MRR |
| Gateway proxy | $7,800 MRR |
| Consulting | $8,000/mo |
| Affiliates + reports | $6,000/mo |
| **Total MRR** | **$21,300** |
| **Total Month 6** | **$35,300** |

### Month 12
| Stream | Revenue |
|--------|---------|
| Pro subscriptions | $27,000 MRR |
| Gateway proxy | $21,000 MRR |
| Consulting | $8,000/mo |
| Affiliates + reports | $4,000/mo |
| **Total MRR** | **$48,000** |
| **Total Month 12** | **$60,000** |

---

## Cost Structure

### Month 1 Costs
| Item | Cost |
|------|------|
| Infrastructure (Vercel, domain) | $20 |
| Stripe fees (2.9% + $0.30) | ~$200 |
| Time (opportunity cost) | $0 (solo founder) |
| **Total** | **~$220** |

### Month 6 Costs
| Item | Cost |
|------|------|
| Infrastructure (proxy servers) | $500 |
| Stripe fees | ~$600 |
| Support (part-time contractor) | $2,000 |
| Marketing | $500 |
| **Total** | **~$3,600** |

### Margins
- **Month 1:** ~97% gross margin
- **Month 6:** ~90% gross margin
- **Month 12:** ~85% gross margin (adding support + infrastructure)

---

## Key Metrics to Track

1. **Web Calculator → CLI conversion rate** (target: 20%)
2. **Free → Pro conversion rate** (target: 12%)
3. **Pro monthly churn** (target: <10%)
4. **Affiliate click-through rate** (target: 15%)
5. **Average revenue per user** (target: $15/mo across all users)
6. **Customer acquisition cost** (target: $0 — organic only)

---

*Revenue model designed April 5, 2026. All projections are conservative estimates based on market size of 250K affected users and 0.1-1% capture rate.*
