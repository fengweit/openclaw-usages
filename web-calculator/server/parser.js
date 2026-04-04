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
        if (msg.role === 'assistant' && msg.usage) {
          const usage = msg.usage;
          const cost = usage.cost || {};
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
