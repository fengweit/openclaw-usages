const chalk = require('chalk');
const Table = require('cli-table3');
const inquirer = require('inquirer');
const {
  estimateMonthlyTokens,
  getAllProviderCosts,
  calculateHybridCost,
  getAllModelKeys,
  getModelName,
} = require('../lib/pricing');

async function optimize(options) {
  console.log(chalk.bold.cyan('\n⚡ OpenClaw Usage Optimizer\n'));

  // Gather inputs interactively or from flags
  let model = options.model;
  let daily = options.daily;
  let tokens = options.tokens;

  if (!model || !daily) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'model',
        message: 'What model are you currently using?',
        choices: getAllModelKeys().map((k) => ({
          name: `${getModelName(k)} (${k})`,
          value: k,
        })),
        when: !model,
      },
      {
        type: 'number',
        name: 'daily',
        message: 'How many messages do you send per day?',
        default: 50,
        when: !daily,
      },
      {
        type: 'list',
        name: 'tokens',
        message: 'Average message complexity?',
        choices: [
          { name: 'Short (500 tokens) — quick questions, lookups', value: 500 },
          { name: 'Medium (2,000 tokens) — typical coding/chat', value: 2000 },
          { name: 'Long (5,000 tokens) — detailed analysis, long code', value: 5000 },
          { name: 'Very Long (10,000 tokens) — deep research, large files', value: 10000 },
        ],
        when: !tokens,
      },
    ]);

    model = model || answers.model;
    daily = daily || answers.daily;
    tokens = tokens || answers.tokens;
  }

  // Calculate usage
  const usage = estimateMonthlyTokens(daily, tokens);
  const allCosts = getAllProviderCosts(usage);
  const hybrid = calculateHybridCost(usage);

  // Find current model cost
  const currentCost = allCosts.find((c) => c.modelKey === model);
  const currentMonthlyCost = currentCost ? currentCost.monthlyCost : 0;

  // Display usage summary
  console.log(chalk.dim('─'.repeat(60)));
  console.log(chalk.bold('📊 Your Usage Profile'));
  console.log(`   Messages/day:    ${chalk.white(daily)}`);
  console.log(`   Tokens/message:  ${chalk.white(tokens.toLocaleString())}`);
  console.log(`   Monthly tokens:  ${chalk.white(usage.monthlyTotal.toLocaleString())}`);
  console.log(`   Input tokens:    ${chalk.white(usage.monthlyInput.toLocaleString())}`);
  console.log(`   Output tokens:   ${chalk.white(usage.monthlyOutput.toLocaleString())}`);
  console.log(`   Current model:   ${chalk.yellow(getModelName(model))}`);
  if (currentCost) {
    console.log(`   Current cost:    ${chalk.red('$' + currentMonthlyCost.toFixed(2) + '/month')}`);
  }
  console.log(chalk.dim('─'.repeat(60)));

  // Cost comparison table
  console.log(chalk.bold('\n💰 Cost Comparison — All Providers\n'));

  const table = new Table({
    head: [
      chalk.cyan('Provider'),
      chalk.cyan('Model'),
      chalk.cyan('Tier'),
      chalk.cyan('Quality'),
      chalk.cyan('Monthly Cost'),
      chalk.cyan('vs Current'),
    ],
    colWidths: [12, 20, 10, 10, 15, 15],
  });

  for (const cost of allCosts) {
    const isCurrent = cost.modelKey === model;
    const savings = currentMonthlyCost - cost.monthlyCost;
    const savingsStr =
      savings > 0
        ? chalk.green(`-$${savings.toFixed(2)}`)
        : savings < 0
          ? chalk.red(`+$${Math.abs(savings).toFixed(2)}`)
          : chalk.dim('current');

    const costStr = `$${cost.monthlyCost.toFixed(2)}`;
    const qualityBar = '█'.repeat(Math.round(cost.quality / 10)) + '░'.repeat(10 - Math.round(cost.quality / 10));

    table.push([
      isCurrent ? chalk.yellow.bold(cost.provider) : cost.provider,
      isCurrent ? chalk.yellow.bold(cost.model) : cost.model,
      cost.tier,
      `${qualityBar} ${cost.quality}`,
      isCurrent ? chalk.yellow.bold(costStr) : costStr,
      savingsStr,
    ]);
  }

  console.log(table.toString());

  // Hybrid routing recommendation
  console.log(chalk.bold('\n🔀 Hybrid Routing (Pro Feature)\n'));
  console.log(`   Routes 70% of queries to ${chalk.blue(hybrid.budgetModel)} (simple tasks)`);
  console.log(`   Routes 30% of queries to ${chalk.magenta(hybrid.premiumModel)} (complex tasks)`);
  console.log(`   Estimated cost:  ${chalk.green('$' + hybrid.monthlyCost.toFixed(2) + '/month')}`);
  if (currentCost) {
    const hybridSavings = currentMonthlyCost - hybrid.monthlyCost;
    if (hybridSavings > 0) {
      console.log(`   You'd save:      ${chalk.green.bold('$' + hybridSavings.toFixed(2) + '/month')} (${hybrid.savingsPercent}%)`);
    }
  }
  console.log(`\n   ${chalk.dim('Upgrade to Pro ($9/mo) for hybrid routing → openclaw-usage upgrade')}`);

  // Recommendations
  console.log(chalk.bold('\n🎯 Recommendations\n'));

  const cheapest = allCosts[0];
  const bestValue = allCosts.find((c) => c.quality >= 85 && c.tier === 'standard');

  console.log(`   ${chalk.green('💸 Cheapest:')} ${cheapest.model} at $${cheapest.monthlyCost.toFixed(2)}/mo (quality: ${cheapest.quality}/100)`);
  if (bestValue) {
    console.log(`   ${chalk.blue('⭐ Best Value:')} ${bestValue.model} at $${bestValue.monthlyCost.toFixed(2)}/mo (quality: ${bestValue.quality}/100)`);
  }
  console.log(`   ${chalk.magenta('🔀 Hybrid:')} $${hybrid.monthlyCost.toFixed(2)}/mo with smart routing (Pro tier)`);

  if (currentCost && cheapest.monthlyCost < currentMonthlyCost) {
    console.log(
      `\n   ${chalk.bold.green('→ You could save up to $' + (currentMonthlyCost - cheapest.monthlyCost).toFixed(2) + '/month by switching!')}`
    );
    console.log(`     Run: ${chalk.cyan('openclaw-usage migrate --target ' + cheapest.modelKey)}`);
  }

  console.log('');
}

module.exports = optimize;
