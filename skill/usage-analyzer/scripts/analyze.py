#!/usr/bin/env python3
"""
OpenClaw Usage Analyzer — Parse session data and output cost report.

Usage:
  python3 analyze.py [--days N] [--sessions-dir PATH] [--json] [--top N]

Reads ~/.openclaw/agents/main/sessions/*.jsonl and produces a cost report.
"""
import json
import os
import sys
import argparse
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

# --- Model pricing (per million tokens) ---
PRICING = {
    "claude-opus-4-6":   {"input": 15, "output": 75, "cache_read": 1.50, "cache_write": 18.75},
    "claude-opus-4-5":   {"input": 15, "output": 75, "cache_read": 1.50, "cache_write": 18.75},
    "claude-sonnet-4-5": {"input": 3,  "output": 15, "cache_read": 0.30, "cache_write": 3.75},
    "claude-haiku-4-5":  {"input": 0.80, "output": 4, "cache_read": 0.08, "cache_write": 1.00},
    "gpt-4o":            {"input": 2.50, "output": 10, "cache_read": 1.25, "cache_write": 2.50},
    "gpt-4o-mini":       {"input": 0.15, "output": 0.60, "cache_read": 0.075, "cache_write": 0.15},
    "gemini-2.5-pro":    {"input": 1.25, "output": 10, "cache_read": 0.315, "cache_write": 1.25},
    "gemini-2.5-flash":  {"input": 0.15, "output": 0.60, "cache_read": 0.0375, "cache_write": 0.15},
}

QUALITY_STARS = {
    "claude-opus-4-6": 5, "claude-opus-4-5": 5,
    "claude-sonnet-4-5": 4, "claude-haiku-4-5": 3,
    "gpt-4o": 4, "gpt-4o-mini": 3,
    "gemini-2.5-pro": 4, "gemini-2.5-flash": 3,
}


def find_sessions_dir():
    """Find the OpenClaw sessions directory."""
    home = Path.home()
    agents_dir = home / ".openclaw" / "agents"
    if not agents_dir.exists():
        return None
    # Find first agent with sessions
    for agent in agents_dir.iterdir():
        sessions = agent / "sessions"
        if sessions.exists() and any(sessions.glob("*.jsonl")):
            return str(sessions)
    return None


def extract_content_summary(content, max_len=150):
    """Extract a human-readable summary from message content blocks."""
    if isinstance(content, str):
        return content[:max_len]
    if not isinstance(content, list):
        return ""

    parts = []
    tool_calls = []
    for block in content:
        if not isinstance(block, dict):
            continue
        btype = block.get("type", "")
        if btype == "text":
            text = block.get("text", "").strip()
            if text:
                parts.append(text[:max_len])
        elif btype == "toolCall":
            name = block.get("name", "unknown")
            args = block.get("arguments", block.get("input", {}))
            # Summarize the tool call
            if isinstance(args, dict):
                if "file_path" in args or "path" in args:
                    target = args.get("file_path") or args.get("path", "")
                    tool_calls.append(f"{name}({target.split('/')[-1] if target else ''})")
                elif "command" in args:
                    cmd = args["command"][:60]
                    tool_calls.append(f"{name}(`{cmd}`)")
                elif "query" in args:
                    tool_calls.append(f"{name}({args['query'][:40]})")
                elif "url" in args:
                    tool_calls.append(f"{name}({args['url'][:40]})")
                else:
                    tool_calls.append(name)
            else:
                tool_calls.append(name)

    summary = ""
    if parts:
        summary = parts[0][:max_len]
    if tool_calls:
        tools_str = ", ".join(tool_calls[:5])
        if summary:
            summary += f" [tools: {tools_str}]"
        else:
            summary = f"[tools: {tools_str}]"
    return summary or "(no text content)"


def extract_user_prompt(content, max_len=120):
    """Extract the user's question/prompt from a user message."""
    if isinstance(content, str):
        # Strip openclaw metadata blocks
        lines = content.split("\n")
        clean = []
        in_meta = False
        for line in lines:
            if "```json" in line or "Conversation info" in line or "Sender (untrusted" in line:
                in_meta = True
                continue
            if in_meta and line.strip() == "```":
                in_meta = False
                continue
            if not in_meta and line.strip():
                clean.append(line.strip())
        return " ".join(clean)[:max_len] if clean else ""

    if not isinstance(content, list):
        return ""

    for block in content:
        if isinstance(block, dict) and block.get("type") == "text":
            text = block.get("text", "")
            # Strip metadata envelope
            return extract_user_prompt(text, max_len)
    return ""


def parse_session_file(filepath):
    """Parse a single JSONL session file, extract assistant message usage."""
    messages = []
    session_meta = {}
    last_user_content = None
    try:
        with open(filepath) as f:
            for line in f:
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue

                if obj.get("type") == "session":
                    session_meta = {"id": obj.get("id"), "timestamp": obj.get("timestamp")}

                if obj.get("type") == "message":
                    msg = obj.get("message", {})
                    role = msg.get("role", "")

                    # Track user messages
                    if role != "assistant":
                        content = msg.get("content", "")
                        last_user_content = content
                        continue

                    if "usage" in msg:
                        usage = msg["usage"]
                        cost = usage.get("cost", {})

                        # Extract content summary
                        content = msg.get("content", [])
                        response_summary = extract_content_summary(content)

                        # Extract user prompt that triggered this
                        user_prompt = extract_user_prompt(last_user_content) if last_user_content else ""

                        # Determine cost driver
                        cost_parts = {
                            "cache_write": cost.get("cacheWrite", 0),
                            "output": cost.get("output", 0),
                            "cache_read": cost.get("cacheRead", 0),
                            "input": cost.get("input", 0),
                        }
                        cost_driver = max(cost_parts, key=cost_parts.get) if any(cost_parts.values()) else "unknown"

                        messages.append({
                            "timestamp": obj.get("timestamp", ""),
                            "model": msg.get("model", "unknown"),
                            "provider": msg.get("provider", "unknown"),
                            "input": usage.get("input", 0),
                            "output": usage.get("output", 0),
                            "cache_read": usage.get("cacheRead", 0),
                            "cache_write": usage.get("cacheWrite", 0),
                            "total_tokens": usage.get("totalTokens", 0),
                            "cost": cost.get("total", 0),
                            "cost_input": cost.get("input", 0),
                            "cost_output": cost.get("output", 0),
                            "cost_cache_read": cost.get("cacheRead", 0),
                            "cost_cache_write": cost.get("cacheWrite", 0),
                            "response_summary": response_summary,
                            "user_prompt": user_prompt,
                            "cost_driver": cost_driver,
                        })
    except Exception as e:
        pass
    return session_meta, messages


def reprice_tokens(tokens, model_key):
    """Calculate what tokens would cost on a different model."""
    p = PRICING.get(model_key)
    if not p:
        return 0
    return (
        tokens["input"] * p["input"] / 1_000_000 +
        tokens["output"] * p["output"] / 1_000_000 +
        tokens["cache_read"] * p["cache_read"] / 1_000_000 +
        tokens["cache_write"] * p["cache_write"] / 1_000_000
    )


def analyze(sessions_dir, days=None, top_n=20):
    """Main analysis: parse all sessions, aggregate, and return report data."""
    sessions_path = Path(sessions_dir)
    jsonl_files = list(sessions_path.glob("*.jsonl"))

    # Load session metadata
    meta_path = sessions_path / "sessions.json"
    session_labels = {}
    if meta_path.exists():
        try:
            with open(meta_path) as f:
                meta = json.load(f)
            for key, val in meta.items():
                sid = val.get("sessionId", "")
                session_labels[sid] = val.get("label", key)
        except Exception:
            pass

    cutoff = None
    if days:
        cutoff = (datetime.now(tz=None) - timedelta(days=days)).isoformat()

    # Aggregate
    total_cost = 0
    total_msgs = 0
    total_input = 0
    total_output = 0
    total_cache_read = 0
    total_cache_write = 0
    daily = defaultdict(float)
    hourly = defaultdict(float)
    model_stats = defaultdict(lambda: {"cost": 0, "msgs": 0, "input": 0, "output": 0, "cache_read": 0, "cache_write": 0})
    all_messages = []
    session_costs = []

    for filepath in jsonl_files:
        meta, messages = parse_session_file(filepath)
        if not messages:
            continue

        # Filter by date
        if cutoff:
            messages = [m for m in messages if m["timestamp"] >= cutoff]
            if not messages:
                continue

        sid = meta.get("id", filepath.stem)
        label = session_labels.get(sid, sid[:12])
        s_cost = sum(m["cost"] for m in messages)

        session_costs.append({"id": sid, "label": label, "cost": s_cost, "messages": len(messages)})

        for m in messages:
            total_cost += m["cost"]
            total_msgs += 1
            total_input += m["input"]
            total_output += m["output"]
            total_cache_read += m["cache_read"]
            total_cache_write += m["cache_write"]

            day = m["timestamp"][:10]
            daily[day] += m["cost"]

            try:
                h = datetime.fromisoformat(m["timestamp"].replace("Z", "+00:00")).hour
                hourly[h] += m["cost"]
            except Exception:
                pass

            model = m["model"]
            model_stats[model]["cost"] += m["cost"]
            model_stats[model]["msgs"] += 1
            model_stats[model]["input"] += m["input"]
            model_stats[model]["output"] += m["output"]
            model_stats[model]["cache_read"] += m["cache_read"]
            model_stats[model]["cache_write"] += m["cache_write"]

            all_messages.append({**m, "session_label": label})

    # Sort
    all_messages.sort(key=lambda x: -x["cost"])
    session_costs.sort(key=lambda x: -x["cost"])
    sorted_daily = sorted(daily.items())

    # Token totals for repricing
    token_totals = {
        "input": total_input,
        "output": total_output,
        "cache_read": total_cache_read,
        "cache_write": total_cache_write,
    }

    # What-if
    whatif = []
    for model_key, pricing in PRICING.items():
        alt_cost = reprice_tokens(token_totals, model_key)
        stars = QUALITY_STARS.get(model_key, 3)
        whatif.append({
            "model": model_key,
            "cost": alt_cost,
            "savings": total_cost - alt_cost,
            "savings_pct": (1 - alt_cost / total_cost) * 100 if total_cost > 0 else 0,
            "quality": stars,
        })
    whatif.sort(key=lambda x: -x["savings"])

    # Cache efficiency
    fresh = total_input + total_output + total_cache_write
    cache_pct = total_cache_read / (total_cache_read + fresh) * 100 if (total_cache_read + fresh) > 0 else 0
    without_cache = (total_cache_read + total_input) * 15 / 1_000_000 + total_output * 75 / 1_000_000  # Opus pricing

    # Cost concentration
    top10_cost = sum(m["cost"] for m in all_messages[:10])
    top10_pct = top10_cost / total_cost * 100 if total_cost > 0 else 0

    num_days = len(daily) or 1
    avg_daily = total_cost / num_days
    projected_monthly = avg_daily * 30

    return {
        "total_cost": total_cost,
        "total_messages": total_msgs,
        "total_sessions": len(session_costs),
        "num_days": num_days,
        "avg_daily": avg_daily,
        "projected_monthly": projected_monthly,
        "cache_pct": cache_pct,
        "without_cache": without_cache,
        "top10_cost": top10_cost,
        "top10_pct": top10_pct,
        "median_msg_cost": sorted([m["cost"] for m in all_messages])[len(all_messages) // 2] if all_messages else 0,
        "daily": sorted_daily,
        "hourly": dict(sorted(hourly.items())),
        "models": dict(model_stats),
        "whatif": whatif,
        "top_messages": all_messages[:top_n],
        "top_sessions": session_costs[:10],
        "tokens": token_totals,
        "first_date": sorted_daily[0][0] if sorted_daily else "N/A",
        "last_date": sorted_daily[-1][0] if sorted_daily else "N/A",
    }


def fmt_cost(c):
    if c >= 1:
        return f"${c:.2f}"
    if c >= 0.01:
        return f"${c:.3f}"
    return f"${c:.4f}"


def fmt_tokens(n):
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n/1_000:.1f}K"
    return str(n)


def render_text(r):
    """Render a human-readable text report for Telegram/chat."""
    lines = []
    lines.append(f"⚡ OpenClaw Usage Report — {r['first_date']} → {r['last_date']}")
    lines.append("━" * 50)
    lines.append("")

    # Summary
    lines.append(f"💰 TOTAL: {fmt_cost(r['total_cost'])} across {r['total_messages']} messages ({r['total_sessions']} sessions)")
    lines.append(f"   Without cache: {fmt_cost(r['without_cache'])} — cache saving you {r['cache_pct']:.0f}%")
    lines.append(f"   Daily avg: {fmt_cost(r['avg_daily'])} · Projected monthly: {fmt_cost(r['projected_monthly'])}")
    lines.append("")

    # Model mix
    lines.append("🤖 MODEL MIX")
    for model, stats in sorted(r["models"].items(), key=lambda x: -x[1]["cost"]):
        if stats["cost"] > 0:
            pct = stats["cost"] / r["total_cost"] * 100
            lines.append(f"   {model}: {fmt_cost(stats['cost'])} ({pct:.0f}%) · {stats['msgs']} msgs")
    lines.append("")

    # Cost distribution
    lines.append("📊 COST DISTRIBUTION")
    lines.append(f"   Top 10 messages: {fmt_cost(r['top10_cost'])} ({r['top10_pct']:.0f}% of total)")
    lines.append(f"   Median message: {fmt_cost(r['median_msg_cost'])}")
    lines.append("")

    # Hourly spend
    if r["hourly"]:
        lines.append("⏰ HOURLY SPEND (UTC)")
        max_h = max(r["hourly"].values()) if r["hourly"] else 1
        for h in range(24):
            cost = r["hourly"].get(h, 0)
            if cost > 0:
                bars = int(cost / max_h * 10) or 1
                lines.append(f"   {h:02d}:00 {'█' * bars:<10} {fmt_cost(cost)}")
        lines.append("")

    # What-if
    lines.append("💡 WHAT-IF: Same tokens on other models")
    lines.append(f"   {'Model':<22} {'Cost':>8}  {'Savings':>10}  Quality")
    lines.append(f"   {'─'*22} {'─'*8}  {'─'*10}  {'─'*7}")
    for w in r["whatif"]:
        stars = "★" * w["quality"] + "☆" * (5 - w["quality"])
        sav = f"-{w['savings_pct']:.0f}%" if w["savings"] > 0 else ""
        lines.append(f"   {w['model']:<22} {fmt_cost(w['cost']):>8}  {sav:>10}  {stars}")
    lines.append("")

    # Top expensive messages with context
    lines.append("🔍 TOP EXPENSIVE MESSAGES")
    cost_driver_labels = {
        "cache_write": "📝 new context loaded",
        "output": "📤 large response",
        "cache_read": "🗄️ cache read",
        "input": "📥 large prompt",
    }
    for i, m in enumerate(r["top_messages"][:10], 1):
        driver = cost_driver_labels.get(m.get("cost_driver", ""), "")
        lines.append(f"   #{i} {fmt_cost(m['cost'])} — {m['model']} · {driver}")
        if m.get("user_prompt"):
            prompt = m["user_prompt"][:100]
            lines.append(f"      ❓ \"{prompt}\"")
        if m.get("response_summary"):
            resp = m["response_summary"][:100]
            lines.append(f"      💬 {resp}")
        # Token breakdown
        parts = []
        if m.get("cache_write", 0) > 0:
            parts.append(f"{fmt_tokens(m['cache_write'])} cache write")
        if m.get("output", 0) > 0:
            parts.append(f"{fmt_tokens(m['output'])} out")
        if m.get("cache_read", 0) > 0:
            parts.append(f"{fmt_tokens(m['cache_read'])} cached")
        lines.append(f"      [{' · '.join(parts)}]")
        if m.get("session_label"):
            lines.append(f"      Session: {m['session_label'][:40]}")
        lines.append("")
    lines.append("")

    # Top sessions
    lines.append("📋 TOP SESSIONS BY COST")
    for i, s in enumerate(r["top_sessions"][:5], 1):
        lines.append(f"   #{i} {fmt_cost(s['cost'])} ({s['messages']} msgs) — {s['label'][:40]}")
    lines.append("")

    # Recommendation
    lines.append("🎯 RECOMMENDATION")
    primary = max(r["models"].items(), key=lambda x: x[1]["cost"])[0] if r["models"] else "unknown"
    if "opus" in primary.lower():
        sonnet_w = next((w for w in r["whatif"] if "sonnet" in w["model"]), None)
        haiku_w = next((w for w in r["whatif"] if "haiku" in w["model"]), None)
        if sonnet_w:
            lines.append(f"   → Switch routine tasks to Sonnet: save ~{fmt_cost(sonnet_w['savings'] * 0.4)}/period")
        if haiku_w:
            lines.append(f"   → Use Haiku for simple queries: save ~{fmt_cost(haiku_w['savings'] * 0.3)}/period")
        lines.append(f"   → Smart hybrid routing: save ~{fmt_cost(r['total_cost'] * 0.5)}/period (est.)")
    else:
        lines.append("   You're already on a cost-efficient model. Consider caching optimization.")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="OpenClaw Usage Analyzer")
    parser.add_argument("--days", type=int, help="Analyze last N days only")
    parser.add_argument("--sessions-dir", help="Path to sessions directory")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--top", type=int, default=20, help="Number of top messages to show")
    args = parser.parse_args()

    sessions_dir = args.sessions_dir or find_sessions_dir()
    if not sessions_dir:
        print("Error: Could not find OpenClaw sessions directory.", file=sys.stderr)
        print("Use --sessions-dir to specify the path.", file=sys.stderr)
        sys.exit(1)

    report = analyze(sessions_dir, days=args.days, top_n=args.top)

    if args.json:
        print(json.dumps(report, indent=2, default=str))
    else:
        print(render_text(report))


if __name__ == "__main__":
    main()
