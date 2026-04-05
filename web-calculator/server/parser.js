/**
 * OpenClaw Session Data Parser
 * Reads session JSONL files and extracts usage/cost data
 */
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const DEFAULT_SESSIONS_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.openclaw/agents/main/sessions'
);

/**
 * Parse a single JSONL session file
 */
async function parseSessionFile(filePath) {
  const messages = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let sessionMeta = null;
  let modelInfo = null;
  let lastUserContent = null;

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);

      if (obj.type === 'session') {
        sessionMeta = {
          id: obj.id,
          timestamp: obj.timestamp,
          cwd: obj.cwd,
        };
      }

      if (obj.type === 'model_change') {
        modelInfo = {
          provider: obj.provider,
          modelId: obj.modelId,
        };
      }

      if (obj.type === 'message') {
        const msg = obj.message || {};

        // Track user messages for context
        if (msg.role !== 'assistant') {
          lastUserContent = msg.content;
          continue;
        }

        if (msg.usage) {
          const usage = msg.usage;
          const cost = usage.cost || {};

          // Extract content summary
          const responseSummary = extractContentSummary(msg.content);
          const userPrompt = extractUserPrompt(lastUserContent);

          // Determine cost driver
          const costParts = {
            cache_write: cost.cacheWrite || 0,
            output: cost.output || 0,
            cache_read: cost.cacheRead || 0,
            input: cost.input || 0,
          };
          const costDriver = Object.entries(costParts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

          messages.push({
            id: obj.id,
            timestamp: obj.timestamp,
            model: msg.model || modelInfo?.modelId || 'unknown',
            provider: msg.provider || modelInfo?.provider || 'unknown',
            inputTokens: usage.input || 0,
            outputTokens: usage.output || 0,
            cacheRead: usage.cacheRead || 0,
            cacheWrite: usage.cacheWrite || 0,
            totalTokens: usage.totalTokens || 0,
            cost: {
              input: cost.input || 0,
              output: cost.output || 0,
              cacheRead: cost.cacheRead || 0,
              cacheWrite: cost.cacheWrite || 0,
              total: cost.total || 0,
            },
            responseSummary,
            userPrompt,
            costDriver,
          });
        }
      }
    } catch (e) {
      // Skip malformed lines
    }
  }

  return { sessionMeta, messages };
}

/**
 * Extract a readable summary from assistant message content
 */
function extractContentSummary(content, maxLen = 150) {
  if (typeof content === 'string') return content.slice(0, maxLen);
  if (!Array.isArray(content)) return '';

  const parts = [];
  const toolCalls = [];

  for (const block of content) {
    if (!block || typeof block !== 'object') continue;
    if (block.type === 'text' && block.text?.trim()) {
      parts.push(block.text.trim().slice(0, maxLen));
    } else if (block.type === 'toolCall') {
      const name = block.name || 'unknown';
      const args = block.arguments || block.input || {};
      if (args.file_path || args.path) {
        const p = args.file_path || args.path;
        toolCalls.push(`${name}(${p.split('/').pop()})`);
      } else if (args.command) {
        toolCalls.push(`${name}(\`${args.command.slice(0, 50)}\`)`);
      } else if (args.query) {
        toolCalls.push(`${name}(${args.query.slice(0, 40)})`);
      } else if (args.url) {
        toolCalls.push(`${name}(${args.url.slice(0, 40)})`);
      } else {
        toolCalls.push(name);
      }
    }
  }

  let summary = parts[0]?.slice(0, maxLen) || '';
  if (toolCalls.length) {
    const tools = toolCalls.slice(0, 5).join(', ');
    summary = summary ? `${summary} [tools: ${tools}]` : `[tools: ${tools}]`;
  }
  return summary || '(no text content)';
}

/**
 * Extract the user's prompt from a user message, stripping OpenClaw metadata
 */
function extractUserPrompt(content, maxLen = 120) {
  if (!content) return '';

  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (Array.isArray(content)) {
    for (const block of content) {
      if (block?.type === 'text' && block.text) {
        text = block.text;
        break;
      }
    }
  }
  if (!text) return '';

  // Strip OpenClaw metadata envelope
  const lines = text.split('\n');
  const clean = [];
  let inMeta = false;
  for (const line of lines) {
    if (line.includes('```json') || line.includes('Conversation info') || line.includes('Sender (untrusted')) {
      inMeta = true;
      continue;
    }
    if (inMeta && line.trim() === '```') {
      inMeta = false;
      continue;
    }
    if (!inMeta && line.trim()) {
      clean.push(line.trim());
    }
  }
  return clean.join(' ').slice(0, maxLen);
}

/**
 * Parse all session files and aggregate data
 */
export async function parseAllSessions(sessionsDir = DEFAULT_SESSIONS_DIR) {
  const sessionsJsonPath = path.join(sessionsDir, 'sessions.json');
  let sessionsMeta = {};

  // Load sessions.json for metadata (labels, kinds, etc.)
  try {
    const raw = fs.readFileSync(sessionsJsonPath, 'utf-8');
    sessionsMeta = JSON.parse(raw);
  } catch (e) {
    console.warn('Could not load sessions.json:', e.message);
  }

  const jsonlFiles = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.jsonl'));

  const sessions = [];
  const dailyCosts = {};
  const hourlyCosts = {};
  const modelStats = {};
  let totalCost = 0;
  let totalMessages = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCacheRead = 0;
  let totalCacheWrite = 0;

  for (const file of jsonlFiles) {
    const filePath = path.join(sessionsDir, file);
    const { sessionMeta, messages } = await parseSessionFile(filePath);

    if (messages.length === 0) continue;

    const sessionId = sessionMeta?.id || file.replace('.jsonl', '');

    // Find matching session metadata
    let label = null;
    let kind = 'unknown';
    let chatType = null;
    for (const [key, meta] of Object.entries(sessionsMeta)) {
      if (meta.sessionId === sessionId || meta.sessionFile?.includes(file)) {
        label = meta.label || key;
        kind = key.includes('cron:') ? 'cron' : key.includes('sub:') ? 'subagent' : 'direct';
        chatType = meta.chatType;
        break;
      }
    }

    let sessionCost = 0;
    let sessionInput = 0;
    let sessionOutput = 0;
    let sessionCacheRead = 0;
    const sessionModels = new Set();
    let firstTs = null;
    let lastTs = null;

    for (const msg of messages) {
      sessionCost += msg.cost.total;
      sessionInput += msg.inputTokens;
      sessionOutput += msg.outputTokens;
      sessionCacheRead += msg.cacheRead;
      sessionModels.add(msg.model);

      if (!firstTs || msg.timestamp < firstTs) firstTs = msg.timestamp;
      if (!lastTs || msg.timestamp > lastTs) lastTs = msg.timestamp;

      // Daily aggregation
      const day = msg.timestamp?.slice(0, 10);
      if (day) {
        dailyCosts[day] = (dailyCosts[day] || 0) + msg.cost.total;
      }

      // Hourly aggregation (for heatmap)
      if (msg.timestamp) {
        const d = new Date(msg.timestamp);
        const hour = d.getUTCHours();
        const dow = d.getUTCDay();
        const key = `${dow}-${hour}`;
        hourlyCosts[key] = (hourlyCosts[key] || 0) + msg.cost.total;
      }

      // Model stats
      const model = msg.model;
      if (!modelStats[model]) {
        modelStats[model] = {
          model,
          provider: msg.provider,
          cost: 0,
          messages: 0,
          inputTokens: 0,
          outputTokens: 0,
          cacheRead: 0,
          cacheWrite: 0,
          sessions: new Set(),
        };
      }
      modelStats[model].cost += msg.cost.total;
      modelStats[model].messages += 1;
      modelStats[model].inputTokens += msg.inputTokens;
      modelStats[model].outputTokens += msg.outputTokens;
      modelStats[model].cacheRead += msg.cacheRead;
      modelStats[model].cacheWrite += msg.cacheWrite;
      modelStats[model].sessions.add(sessionId);

      totalCost += msg.cost.total;
      totalMessages += 1;
      totalInputTokens += msg.inputTokens;
      totalOutputTokens += msg.outputTokens;
      totalCacheRead += msg.cacheRead;
      totalCacheWrite += msg.cacheWrite;
    }

    sessions.push({
      id: sessionId,
      file,
      label,
      kind,
      chatType,
      cost: sessionCost,
      messages: messages.length,
      inputTokens: sessionInput,
      outputTokens: sessionOutput,
      cacheRead: sessionCacheRead,
      models: [...sessionModels],
      firstMessage: firstTs,
      lastMessage: lastTs,
      messageDetails: messages, // Full per-message data
    });
  }

  // Convert model sessions Set to count
  const modelStatsArray = Object.values(modelStats).map(m => ({
    ...m,
    sessions: m.sessions.size,
  }));

  // Daily costs as sorted array
  const dailyCostsArray = Object.entries(dailyCosts)
    .map(([date, cost]) => ({ date, cost }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Hourly heatmap
  const heatmapData = Object.entries(hourlyCosts)
    .map(([key, cost]) => {
      const [dow, hour] = key.split('-').map(Number);
      return { dow, hour, cost };
    });

  // Top expensive messages across all sessions
  const allMessages = sessions.flatMap(s =>
    s.messageDetails.map(m => ({ ...m, sessionId: s.id, sessionLabel: s.label }))
  );
  const topMessages = allMessages
    .sort((a, b) => b.cost.total - a.cost.total)
    .slice(0, 50);

  // Cache efficiency
  const totalFreshTokens = totalInputTokens + totalOutputTokens + totalCacheWrite;
  const cacheHitRate = totalCacheRead > 0
    ? totalCacheRead / (totalCacheRead + totalFreshTokens)
    : 0;

  return {
    summary: {
      totalCost,
      totalMessages,
      totalSessions: sessions.length,
      totalInputTokens,
      totalOutputTokens,
      totalCacheRead,
      totalCacheWrite,
      cacheHitRate,
      firstDate: dailyCostsArray[0]?.date,
      lastDate: dailyCostsArray[dailyCostsArray.length - 1]?.date,
      avgCostPerDay: dailyCostsArray.length > 0
        ? totalCost / dailyCostsArray.length
        : 0,
      avgCostPerSession: sessions.length > 0
        ? totalCost / sessions.length
        : 0,
      avgCostPerMessage: totalMessages > 0
        ? totalCost / totalMessages
        : 0,
    },
    sessions: sessions
      .sort((a, b) => b.cost - a.cost)
      .map(s => ({ ...s, messageDetails: undefined })), // Don't send per-msg to overview
    dailyCosts: dailyCostsArray,
    heatmap: heatmapData,
    models: modelStatsArray.sort((a, b) => b.cost - a.cost),
    topMessages,
  };
}

/**
 * Get detailed data for a single session
 */
export async function getSessionDetail(sessionId, sessionsDir = DEFAULT_SESSIONS_DIR) {
  const jsonlFiles = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.jsonl'));
  const file = jsonlFiles.find(f => f.includes(sessionId));
  if (!file) return null;

  const filePath = path.join(sessionsDir, file);
  return parseSessionFile(filePath);
}
