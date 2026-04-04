const chalk = require('chalk');
const Table = require('cli-table3');
const Conf = require('conf');

const store = new Conf({ projectName: 'openclaw-usage' });

async function stats(options) {
  console.log(chalk.bold.cyan('\n📊 Usage Statistics Dashboard\n'));

  const tracking = store.get('tracking', { daily: [] });
  const period = options.period || 'weekly';

  if (tracking.daily.length === 0) {
    // Show demo data if no real tracking data exists
    console.log(chalk.yellow('  No usage data recorded yet.\n'));
    console.log(chalk.dim('  Usage tracking starts automatically after your first optimization.'));
    console.log(chalk.dim('  Here\'s what your dashboard will look like:\n'));
    showDemoData(period, options.json);
    return;
  }

  // Show real data
  const periodData = aggregateByPeriod(tracking.daily, period);

  if (options.json) {
    console.log(JSON.stringify(periodData, null, 2));
    return;
  }

  showDashboard(periodData, period, tracking);
}

function showDemoData(period, asJson) {
  const now = new Date();
  const demoData = [];

  // Generate 30 days of demo data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const messages = isWeekend ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 80) + 30;
    const tokens = messages * (Math.floor(Math.random() * 3000) + 1000);
    const cost = (tokens / 1_000_000) * 18; // Approximate blended rate

    demoData.push({
      date: date.toISOString().split('T')[0],
      messages,
      tokens,
      cost: Math.round(cost * 100) / 100,
      model: Math.random() > 0.3 ? 'claude-sonnet' : 'claude-opus',
    });
  }

  if (asJson) {
    console.log(JSON.stringify(demoData, null, 2));
    return;
  }

  const aggregated = aggregateByPeriod(demoData, period);
  showDashboard(aggregated, period, { daily: demoData });
  console.log(chalk.dim('\n  ⓘ  This is demo data. Real tracking begins on first use.\n'));
}

function aggregateByPeriod(daily, period) {
  if (period === 'daily') {
    return daily.slice(-14); // Last 14 days
  }

  if (period === 'weekly') {
    const weeks = {};
    for (const day of daily) {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toISOString().split('T')[0];

      if (!weeks[key]) {
        weeks[key] = { date: key, messages: 0, tokens: 0, cost: 0, days: 0 };
      }
      weeks[key].messages += day.messages;
      weeks[key].tokens += day.tokens;
      weeks[key].cost += day.cost;
      weeks[key].days += 1;
    }
    return Object.values(weeks).slice(-8); // Last 8 weeks
  }

  if (period === 'monthly') {
    const months = {};
    for (const day of daily) {
      const key = day.date.substring(0, 7); // YYYY-MM
      if (!months[key]) {
        months[key] = { date: key, messages: 0, tokens: 0, cost: 0, days: 0 };
      }
      months[key].messages += day.messages;
      months[key].tokens += day.tokens;
      months[key].cost += day.cost;
      months[key].days += 1;
    }
    return Object.values(months).slice(-6); // Last 6 months
  }

  return daily;
}

function showDashboard(data, period, tracking) {
  // Summary stats
  const totalCost = tracking.daily.reduce((sum, d) => sum + d.cost, 0);
  const totalMessages = tracking.daily.reduce((sum, d) => sum + d.messages, 0);
  const totalTokens = tracking.daily.reduce((sum, d) => sum + d.tokens, 0);
  const avgDailyCost = totalCost / Math.max(tracking.daily.length, 1);

  console.log(chalk.bold('  📈 Summary'));
  console.log(`     Total spend:       ${chalk.red('$' + totalCost.toFixed(2))}`);
  console.log(`     Total messages:    ${chalk.white(totalMessages.toLocaleString())}`);
  console.log(`     Total tokens:      ${chalk.white(totalTokens.toLocaleString())}`);
  console.log(`     Avg daily cost:    ${chalk.yellow('$' + avgDailyCost.toFixed(2))}`);
  console.log(`     Projected monthly: ${chalk.yellow('$' + (avgDailyCost * 30).toFixed(2))}`);

  // Budget check
  const budget = store.get('config.budgetAlert', 100);
  const projectedMonthly = avgDailyCost * 30;
  if (projectedMonthly > budget) {
    console.log(`     ${chalk.red.bold('⚠️  Over budget!')} Projected $${projectedMonthly.toFixed(2)} > $${budget} limit`);
  } else {
    console.log(`     ${chalk.green('✅ Within budget')} ($${budget}/mo limit)`);
  }

  // Period table
  const periodLabel = period === 'daily' ? 'Day' : period === 'weekly' ? 'Week' : 'Month';

  console.log(chalk.bold(`\n  📅 ${periodLabel}ly Breakdown\n`));

  const table = new Table({
    head: [
      chalk.cyan(periodLabel),
      chalk.cyan('Messages'),
      chalk.cyan('Tokens'),
      chalk.cyan('Cost'),
      chalk.cyan('Trend'),
    ],
    colWidths: [14, 12, 16, 12, 20],
  });

  let prevCost = null;
  for (const row of data) {
    const trend = prevCost !== null
      ? row.cost > prevCost
        ? chalk.red('▲ +$' + (row.cost - prevCost).toFixed(2))
        : row.cost < prevCost
          ? chalk.green('▼ -$' + (prevCost - row.cost).toFixed(2))
          : chalk.dim('━ same')
      : chalk.dim('—');

    const costBar = '█'.repeat(Math.min(Math.round(row.cost / (data.reduce((max, d) => Math.max(max, d.cost), 1) / 8)), 8));

    table.push([
      row.date,
      row.messages.toLocaleString(),
      row.tokens.toLocaleString(),
      '$' + row.cost.toFixed(2),
      `${costBar} ${trend}`,
    ]);

    prevCost = row.cost;
  }

  console.log(table.toString());

  // Model usage breakdown
  const modelUsage = {};
  for (const day of tracking.daily) {
    const model = day.model || 'unknown';
    if (!modelUsage[model]) {
      modelUsage[model] = { messages: 0, cost: 0 };
    }
    modelUsage[model].messages += day.messages;
    modelUsage[model].cost += day.cost;
  }

  if (Object.keys(modelUsage).length > 0) {
    console.log(chalk.bold('\n  🤖 Model Usage\n'));

    const modelTable = new Table({
      head: [chalk.cyan('Model'), chalk.cyan('Messages'), chalk.cyan('Cost'), chalk.cyan('% of Spend')],
      colWidths: [20, 12, 12, 14],
    });

    const sortedModels = Object.entries(modelUsage).sort((a, b) => b[1].cost - a[1].cost);
    for (const [model, usage] of sortedModels) {
      const pct = ((usage.cost / totalCost) * 100).toFixed(1);
      modelTable.push([model, usage.messages.toLocaleString(), '$' + usage.cost.toFixed(2), pct + '%']);
    }

    console.log(modelTable.toString());
  }

  console.log(`\n  ${chalk.dim('Tip: Run "openclaw-usage optimize" to find cheaper alternatives')}\n`);
}

module.exports = stats;
