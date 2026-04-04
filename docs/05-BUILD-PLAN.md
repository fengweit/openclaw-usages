# 05 — Build Plan: 7 Days (April 6–12, 2026)

## Principles
- Ship working software every day
- Free features first, premium later
- Test as you build, not after
- If a feature takes longer than 2 hours, simplify it

---

## Day 1 — Sunday, April 6: Foundation

### Morning (8:00 AM – 12:00 PM)

**8:00–9:00 | Project Setup**
- [x] Initialize GitHub repos (cli-tool, web-calculator)
- [ ] Set up npm package (`openclaw-usage`)
- [ ] Configure CI/CD (GitHub Actions for tests)
- [ ] Set up Vercel project for web calculator

**9:00–10:30 | CLI Tool Skeleton**
- [ ] Wire up Commander.js with all subcommands
- [ ] Implement `--help` for every command
- [ ] Test: `openclaw-usage --help` shows all commands
- [ ] Test: each subcommand `--help` works

**10:30–12:00 | Pricing Engine**
- [ ] Implement `src/lib/pricing.js` with all provider data
- [ ] Unit test: `calculateCost()` for every model
- [ ] Unit test: `estimateMonthlyTokens()` edge cases
- [ ] Unit test: `getAllProviderCosts()` returns correct comparisons

### Afternoon (1:00 PM – 6:00 PM)

**1:00–3:00 | Optimize Command**
- [ ] Build interactive prompts (inquirer)
- [ ] Build comparison table output (cli-table3)
- [ ] Add chalk coloring for savings/costs
- [ ] Test: full interactive flow works
- [ ] Test: `--json` flag outputs valid JSON

**3:00–5:00 | Web Calculator Scaffold**
- [ ] Set up Vite + React project structure
- [ ] Build `Calculator.jsx` with form inputs
- [ ] Implement `calculator.js` pricing logic
- [ ] Test: form renders, inputs work

**5:00–6:00 | Day 1 Integration**
- [ ] CLI: `npm link` and test globally
- [ ] Web: `npm run dev` and verify hot reload
- [ ] Commit and push both repos
- [ ] Update README with Day 1 progress

### Day 1 Deliverable
✅ CLI tool installs and runs `optimize` command
✅ Web calculator renders with working form

---

## Day 2 — Monday, April 7: Core Features

### Morning (8:00 AM – 12:00 PM)

**8:00–10:00 | Migration Command**
- [ ] Config detection logic (check standard paths)
- [ ] Backup creation (`~/.openclaw/backups/`)
- [ ] Config generation for each provider
- [ ] Interactive provider/model selection

**10:00–12:00 | Rollback Command**
- [ ] List backups with metadata
- [ ] Restore selected backup
- [ ] Validate restored config
- [ ] Test: migrate → rollback cycle works

### Afternoon (1:00 PM – 6:00 PM)

**1:00–3:00 | Config Command**
- [ ] `config show` — display all settings
- [ ] `config set` — update settings with validation
- [ ] `config reset` — restore defaults
- [ ] Conf store integration

**3:00–5:00 | Web Calculator Results**
- [ ] Build `Results.jsx` — ranked provider list
- [ ] Build `ProviderCard.jsx` — individual cards
- [ ] Build `CostChart.jsx` — CSS bar chart
- [ ] Wire everything together

**5:00–6:00 | Day 2 Integration**
- [ ] CLI: all free commands working end-to-end
- [ ] Web: full calculator → results flow
- [ ] Commit, push, test on clean machine

### Day 2 Deliverable
✅ CLI: optimize, migrate, rollback, config all working
✅ Web: complete calculator with visual results

---

## Day 3 — Tuesday, April 8: Premium Features

### Morning (8:00 AM – 12:00 PM)

**8:00–10:00 | Stats Command**
- [ ] Read usage data from Conf store
- [ ] Daily/weekly/monthly breakdown tables
- [ ] Top models used
- [ ] Cost trend calculation

**10:00–12:00 | Upgrade Command**
- [ ] Free vs Pro comparison table
- [ ] License key input and basic validation
- [ ] Pro feature gating (check license before premium features)

### Afternoon (1:00 PM – 6:00 PM)

**1:00–3:00 | Web Calculator Polish**
- [ ] Responsive design testing (mobile, tablet, desktop)
- [ ] Dark theme refinement
- [ ] Loading states and transitions
- [ ] Recommendation badges logic

**3:00–4:30 | Affiliate Integration**
- [ ] Add affiliate links to web calculator ProviderCards
- [ ] Add referral URLs to CLI optimize output
- [ ] Track clicks (query params for attribution)

**4:30–6:00 | Premium Report Foundation**
- [ ] Design report template (markdown → PDF)
- [ ] Generate personalized recommendations
- [ ] CLI: `report` command (Pro-only)

### Day 3 Deliverable
✅ All CLI commands implemented
✅ Web calculator fully polished and responsive
✅ Affiliate links integrated

---

## Day 4 — Wednesday, April 9: Monitoring & Analytics

### Morning (8:00 AM – 12:00 PM)

**8:00–10:00 | Usage Tracking**
- [ ] Intercept and log request data to Conf store
- [ ] Calculate cost per request in real-time
- [ ] Token counting logic

**10:00–12:00 | Budget Alerts**
- [ ] Monthly budget threshold checking
- [ ] Daily budget checking (Pro)
- [ ] Console warnings when approaching budget
- [ ] Budget exceeded notification

### Afternoon (1:00 PM – 6:00 PM)

**1:00–3:00 | Analytics Dashboard (CLI)**
- [ ] ASCII bar charts for model distribution
- [ ] Sparkline for cost trends
- [ ] Summary statistics

**3:00–5:00 | Web Analytics**
- [ ] Set up Plausible analytics on web calculator
- [ ] Add event tracking (calculator use, CTA clicks)
- [ ] Funnel tracking (visit → calculate → download CLI)

**5:00–6:00 | Day 4 Integration**
- [ ] Test tracking with simulated usage data
- [ ] Verify budget alerts fire correctly
- [ ] Commit and push

### Day 4 Deliverable
✅ Usage tracking captures data correctly
✅ Budget alerts working
✅ Analytics integrated

---

## Day 5 — Thursday, April 10: Payments & Polish

### Morning (8:00 AM – 12:00 PM)

**8:00–10:00 | Stripe Setup**
- [ ] Create Stripe account and test keys
- [ ] Create Pro subscription product ($9/mo)
- [ ] Create Premium Report product ($9 one-time)
- [ ] Set up webhook for subscription events

**10:00–12:00 | Payment Integration**
- [ ] Web: Stripe checkout for Pro + Reports
- [ ] CLI: License key validation against Stripe
- [ ] Handle subscription lifecycle (create, cancel, expire)

### Afternoon (1:00 PM – 6:00 PM)

**1:00–3:00 | Landing Page**
- [ ] Hero section: "Stop Overpaying for AI"
- [ ] Feature comparison section
- [ ] Pricing section (Free / Pro / Gateway)
- [ ] Testimonials section (early beta users)
- [ ] CTA: Download CLI + Open Calculator

**3:00–5:00 | UI/UX Polish**
- [ ] Web: smooth transitions between states
- [ ] Web: error states and edge cases
- [ ] CLI: better error messages
- [ ] CLI: progress spinners (ora) for long operations

**5:00–6:00 | Day 5 Integration**
- [ ] Test full payment flow (test mode)
- [ ] Test Pro features enable after payment
- [ ] Commit and push

### Day 5 Deliverable
✅ Payments working end-to-end (test mode)
✅ Landing page deployed
✅ Polish complete

---

## Day 6 — Friday, April 11: Testing & Documentation

### Morning (8:00 AM – 12:00 PM)

**8:00–10:00 | End-to-End Testing**
- [ ] CLI: fresh install → optimize → migrate → stats → rollback
- [ ] CLI: free user flow vs Pro user flow
- [ ] Web: calculate → compare → affiliate click
- [ ] Payment: subscribe → verify Pro → cancel

**10:00–12:00 | Edge Cases**
- [ ] CLI: no config file found
- [ ] CLI: invalid API keys
- [ ] CLI: network errors
- [ ] Web: extreme values (100 messages, 10,000 messages)
- [ ] Web: mobile responsiveness final check

### Afternoon (1:00 PM – 6:00 PM)

**1:00–3:00 | Documentation**
- [ ] CLI README: install, all commands, examples
- [ ] Web README: setup, deployment
- [ ] Update main project README
- [ ] API documentation (if needed)

**3:00–5:00 | Marketing Prep**
- [ ] Write Reddit posts (r/OpenClaw, r/artificial, r/programming)
- [ ] Write Twitter/X thread
- [ ] Write Hacker News Show HN post
- [ ] Prepare Discord announcement
- [ ] Record 2-minute demo video

**5:00–6:00 | Pre-Launch Checklist**
- [ ] Switch Stripe to live mode
- [ ] Verify Vercel deployment is stable
- [ ] Verify npm publish is ready
- [ ] Stage all marketing posts
- [ ] Backup everything

### Day 6 Deliverable
✅ Everything tested and documented
✅ Marketing materials ready
✅ Pre-launch checklist complete

---

## Day 7 — Saturday, April 12: 🚀 LAUNCH

### Morning (8:00 AM – 10:00 AM)

**8:00–9:00 | Final Deployment**
- [ ] `npm publish` — CLI tool live on npm
- [ ] Verify Vercel deployment — web calculator live
- [ ] Switch Stripe to production
- [ ] Smoke test everything one more time

**9:00–10:00 | Launch Posts**
- [ ] Reddit: r/OpenClaw — "I built a free tool to save you money after the price hike"
- [ ] Reddit: r/artificial — "Open-source AI cost optimizer (born from the OpenClaw crisis)"
- [ ] Reddit: r/programming — "[Show] CLI tool to analyze and optimize AI API costs"
- [ ] Twitter/X: Thread with screenshots and demo
- [ ] Hacker News: "Show HN: OpenClaw Usage — AI cost analyzer born from the pricing crisis"
- [ ] Discord: OpenClaw community + AI dev servers

### Late Morning (10:00 AM – 12:00 PM)

**10:00–12:00 | Community Engagement**
- [ ] Reply to every comment on Reddit posts
- [ ] Engage with Twitter replies
- [ ] Answer HN comments
- [ ] Monitor for bugs reported by early users

### Afternoon (1:00 PM – 6:00 PM)

**1:00–3:00 | Hot Fixes**
- [ ] Fix any bugs reported by early users
- [ ] Push updates quickly
- [ ] Communicate fixes publicly

**3:00–5:00 | Amplification**
- [ ] DM dev influencers with the tool
- [ ] Post in additional Discord servers
- [ ] Share on LinkedIn
- [ ] YouTube: upload demo video

**5:00–6:00 | Day 7 Review**
- [ ] Check analytics: installs, visits, signups
- [ ] Check revenue: affiliate clicks, Pro signups
- [ ] Write up Day 1 learnings
- [ ] Plan Week 2 priorities

### Day 7 Deliverable
✅ Everything live and working
✅ Community engaged
✅ First users and (hopefully) first revenue

---

## Success Metrics by End of Day 7

| Metric | Minimum | Target | Stretch |
|--------|---------|--------|---------|
| npm installs | 50 | 200 | 500 |
| Web calculator visits | 200 | 1,000 | 5,000 |
| Pro trials started | 5 | 20 | 50 |
| Paying customers | 1 | 10 | 50 |
| Revenue | $100 | $500 | $2,000 |
| GitHub stars | 10 | 50 | 200 |

---

*Plan created April 5, 2026. Adjust daily based on actual progress and community feedback.*
