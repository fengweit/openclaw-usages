# 06 — Launch Strategy

**Goal:** Maximize visibility during the crisis window (April 6–12, 2026) across every channel where affected OpenClaw users congregate.

---

## Channel Matrix

| Channel | Audience Size | Effort | Expected Traffic | Conversion |
|---------|--------------|--------|-----------------|------------|
| Reddit | ~150K subscribers | Medium | 2,000–5,000 visits | 3–5% |
| Twitter/X | ~500K AI dev audience | Medium | 1,000–3,000 visits | 2–4% |
| Hacker News | ~1M monthly | High | 5,000–20,000 visits | 1–3% |
| Discord | ~50K in AI servers | Low | 500–1,000 visits | 5–8% |
| YouTube | ~10K targeted views | High | 500–2,000 visits | 4–6% |
| Product Hunt | ~30K daily | Medium | 1,000–3,000 visits | 3–5% |
| Dev.to / Hashnode | ~20K readers | Low | 300–800 visits | 2–4% |

---

## 1. Reddit Strategy

### Target Subreddits

| Subreddit | Subscribers | Post Type | Timing |
|-----------|------------|-----------|--------|
| r/OpenClaw | ~45K | Solution post | Day 1 (April 6) |
| r/artificial | ~800K | Discussion | Day 1 |
| r/programming | ~5.5M | Show HN style | Day 2 |
| r/SideProject | ~250K | Launch post | Day 7 |
| r/selfhosted | ~350K | Tool announcement | Day 3 |
| r/ChatGPT | ~4M | Alternative costs | Day 2 |

### Post Templates

#### r/OpenClaw — "I built a free tool to cut your OpenClaw costs by 60%"

```
Title: I built a free CLI tool to analyze and optimize your OpenClaw costs after the price hike

Body:
Like many of you, I was hit by the April pricing changes. My monthly bill went from $45 to $120 overnight.

Instead of just complaining, I built something:

**openclaw-usage** — a CLI tool that:
- Analyzes your current OpenClaw spending
- Compares costs across Claude, GPT-4, and Gemini
- Migrates your config to cheaper providers in one command
- Tracks your costs over time with budget alerts

Free tier gets you cost analysis + single-provider migration.
Pro ($9/mo) adds hybrid routing across multiple providers.

Also built a web calculator if you just want a quick comparison:
[link]

GitHub: [link]
npm: `npm install -g openclaw-usage`

Happy to answer questions. What's your current monthly spend looking like?
```

#### r/programming — Technical angle

```
Title: Show r/programming: Built a multi-provider cost optimizer for AI coding assistants

Body:
The recent OpenClaw pricing changes affected ~250K developers. I built an open-source
CLI tool that compares costs across providers and can migrate your config automatically.

Tech stack:
- Node.js CLI with Commander, Inquirer, Chalk
- React web calculator (Vite)
- Local cost tracking with Conf
- Supports Claude, GPT-4, Gemini pricing

Interesting technical decisions:
- Hybrid routing sends simple queries to cheap models, complex ones to expensive models
- Config backup/rollback for safe migration
- Token estimation from message patterns

GitHub: [link]
```

### Reddit Rules
- **No direct self-promotion spam** — frame as community contribution
- **Engage in comments** for 2+ hours after posting
- **Cross-post sparingly** — max 3 subreddits on launch day
- **Use throwaway/alt if main account is new** — karma matters

---

## 2. Twitter/X Strategy

### Launch Thread (Day 7, April 12)

```
🧵 Thread: I built a tool to save OpenClaw users $50-100/month after the price hike

1/ The OpenClaw pricing crisis hit 250K+ developers this week.
   Monthly costs jumped 2-3x overnight with no warning.
   
   I spent 7 days building a solution. Here's what happened 👇

2/ The problem:
   - OpenClaw locked users into single AI providers
   - No cost visibility or tracking
   - Migration between providers = manual config nightmare
   - No way to optimize spending

3/ The solution: openclaw-usage
   ✅ Cost analysis across all providers
   ✅ One-command migration
   ✅ Hybrid routing (smart model selection)
   ✅ Budget alerts
   ✅ Usage tracking
   
   Free tier covers most users.

4/ Quick demo: [video/gif]
   
   $ openclaw-usage optimize
   
   Shows you exactly how much you'd save switching
   from Claude Opus to GPT-4o or Gemini Pro.

5/ Web calculator for quick comparisons:
   [link]
   
   No signup. No tracking. Just paste your usage numbers.

6/ The numbers:
   - Average savings: $52/month
   - Hybrid routing saves additional 30-40%
   - Migration takes < 2 minutes
   
   npm install -g openclaw-usage

7/ Open source, MIT licensed.
   GitHub: [link]
   
   PRs welcome. Let's help the community. 🫡
```

### Engagement Strategy
- **Quote-tweet** Theo's original thread about the crisis
- **Reply to** every complaint thread with the tool link
- **Tag** AI influencers who covered the crisis
- **Post at** 9 AM PT (peak dev Twitter)
- **Pin** the thread for 2 weeks

### Accounts to Engage
- @theo (covered the crisis)
- @levelsio (indie hacker audience)
- @swyx (AI engineering)
- @fireship (dev content)

---

## 3. Hacker News Strategy

### Show HN Post (Day 7, April 12, 9 AM ET)

```
Title: Show HN: OpenClaw Usage Optimizer – Cut AI assistant costs by 60%

Body:
Hi HN,

After the OpenClaw pricing changes this week, I built a CLI tool and web
calculator to help developers optimize their AI assistant spending.

The tool compares costs across Claude (Opus/Sonnet/Haiku), GPT-4
(4o/4o-mini/Turbo), and Gemini (Pro/Flash) — and can migrate your
OpenClaw config in one command.

Key features:
- Cost analysis with savings projections
- One-command provider migration with rollback
- Usage tracking and budget alerts  
- Hybrid routing (Pro): route simple queries to cheap models automatically

Web calculator (no install): [link]
CLI: npm install -g openclaw-usage
GitHub: [link]

Built in 7 days with Node.js + React. MIT licensed.

Would love feedback on the hybrid routing logic — it's the most
interesting technical challenge (how to classify query complexity
for model selection).
```

### HN Tips
- **Post between 8–10 AM ET** on weekdays
- **Ask a genuine question** in the post to encourage discussion
- **Respond to every comment** within the first 2 hours
- **Don't ask for upvotes** — let the content speak
- **Have 2-3 friends** read it for early engagement (not vote manipulation)
- **Technical depth** wins on HN — be ready to discuss architecture

---

## 4. Discord Strategy

### Target Servers
- **OpenClaw Official** — #general and #tools channels
- **AI Engineering** — #projects channel
- **Theo's Discord** — #general
- **Fireship Discord** — #showcase
- **Indie Hackers** — #launches

### Message Template

```
Hey everyone 👋

Built a free tool this week in response to the pricing changes:

**openclaw-usage** — CLI tool to analyze and optimize your OpenClaw costs

• Compare costs across Claude, GPT-4, Gemini
• Migrate your config in one command  
• Track spending with budget alerts
• Web calculator: [link]

`npm install -g openclaw-usage`

Open source: [github link]

Saved me $67/month switching to hybrid routing. Happy to help anyone set it up!
```

### Discord Rules
- **Read server rules first** — some ban self-promotion
- **Be helpful first** — answer questions about the crisis, then mention the tool
- **Don't spam** — one message per server, engage in replies
- **Offer to help** individuals migrate — builds trust

---

## 5. YouTube Strategy

### Demo Video (Record Day 6, Publish Day 7)

**Title:** "How I Cut My OpenClaw Bill by 60% (Free Tool)"

**Length:** 5–8 minutes

**Script Outline:**
1. **Hook** (0:00–0:30): "My OpenClaw bill went from $45 to $120 overnight. Here's how I fixed it."
2. **The Problem** (0:30–1:30): Show the pricing changes, community reaction
3. **The Solution** (1:30–2:30): Introduce openclaw-usage
4. **CLI Demo** (2:30–4:30): Live terminal walkthrough
   - `openclaw-usage optimize` — show cost comparison
   - `openclaw-usage migrate` — migrate config
   - `openclaw-usage stats` — show tracking
5. **Web Calculator** (4:30–5:30): Quick web demo
6. **Results** (5:30–6:30): Before/after costs
7. **CTA** (6:30–7:00): Links, subscribe, comment

### Production Notes
- **Screen recording:** OBS or ScreenFlow
- **Terminal:** Use a clean terminal with large font
- **Thumbnail:** Split screen — "Before: $120/mo" vs "After: $45/mo" with red/green
- **Tags:** openclaw, ai pricing, developer tools, cost optimization

---

## 6. Product Hunt Launch (Day 7+1, April 13)

### Listing

**Tagline:** "Cut your AI assistant costs by 60% — free CLI + web calculator"

**Description:**
```
OpenClaw Usage Optimizer helps developers affected by recent AI pricing 
changes find the cheapest provider for their usage pattern.

🔍 Analyze current spending across Claude, GPT-4, and Gemini
🔄 Migrate your config in one command
📊 Track costs with budget alerts
⚡ Hybrid routing sends queries to the optimal model

Free: cost analysis + migration + 7-day tracking
Pro ($9/mo): hybrid routing + unlimited tracking + custom rules
```

**Categories:** Developer Tools, Artificial Intelligence, Productivity

**Maker Comment:**
```
Hey PH! 👋

I built this in 7 days after the OpenClaw pricing crisis hit 250K developers.

The core insight: most developers are overpaying because they use expensive 
models (Claude Opus, GPT-4) for simple tasks that cheaper models handle 
just as well.

The hybrid routing in Pro mode automatically classifies your queries and 
routes them to the optimal model — typically saving 40-60%.

Would love your feedback! What features would you want to see next?
```

---

## 7. Content Marketing (Week 2+)

### Blog Posts
1. "The OpenClaw Pricing Crisis: What Happened and What to Do" (Day 8)
2. "Claude vs GPT-4 vs Gemini: Real Cost Comparison for Developers" (Day 10)
3. "How Hybrid AI Routing Saves 60% Without Sacrificing Quality" (Day 14)
4. "Building a CLI Tool in 7 Days: Lessons Learned" (Day 21)

### Dev.to Articles
- Republish blog posts with canonical links
- Add to "AI" and "Developer Tools" tags
- Engage in comments

### Newsletter Pitches
- **TLDR Newsletter** — "New tool helps developers cut AI costs"
- **Console.dev** — Weekly picks for developer tools
- **Changelog** — Open source project spotlight

---

## Timeline Summary

| Day | Action | Channel |
|-----|--------|---------|
| April 6 (Day 1) | Reddit r/OpenClaw post | Reddit |
| April 6 | Discord announcements | Discord |
| April 7 (Day 2) | Reddit r/programming, r/ChatGPT | Reddit |
| April 8 (Day 3) | Reddit r/selfhosted | Reddit |
| April 9 (Day 4) | Twitter teaser thread | Twitter/X |
| April 10 (Day 5) | Record demo video | YouTube (prep) |
| April 11 (Day 6) | Edit video, prep HN post | YouTube, HN (prep) |
| April 12 (Day 7) | **LAUNCH DAY** — HN, Twitter thread, YouTube publish | All |
| April 13 | Product Hunt launch | Product Hunt |
| April 14+ | Blog posts, newsletter pitches | Content |

---

## Metrics to Track

### Week 1 KPIs
- **GitHub stars** — target 100+
- **npm installs** — target 200+
- **Web calculator visits** — target 1,000+
- **Twitter impressions** — target 50K+
- **HN points** — target 50+
- **Paying customers** — target 10+
- **Revenue** — target $500+

### Tools
- **GitHub Insights** for repo traffic
- **npm stats** for install counts
- **Vercel Analytics** for web traffic
- **Plausible/Umami** for privacy-friendly analytics
- **Stripe Dashboard** for revenue

---

## Crisis Response Playbook

### If competition launches first:
- Emphasize our advantages: open source, free tier, simpler
- Speed up launch by 1–2 days if possible
- Focus on community engagement over features

### If HN post fails:
- Repost with different angle in 3 days
- Double down on Reddit and Twitter
- Consider a technical blog post that links to the tool

### If conversion is low:
- A/B test landing page copy
- Add more free features to build trust
- Create video testimonials from early users
- Reduce Pro price to $5/mo temporarily

### If quality complaints:
- Fix bugs within 2 hours of report
- Public changelog updates
- Personal outreach to complainers
- "First 100 users get lifetime Pro" as goodwill

---

*Speed wins. Ship fast, iterate faster. The crisis window is 7–14 days.*
