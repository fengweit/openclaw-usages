#!/usr/bin/env node

const { Command } = require('commander');
const pkg = require('../package.json');

const program = new Command();

program
  .name('openclaw-usage')
  .description('Analyze, optimize, and manage your OpenClaw AI provider costs')
  .version(pkg.version);

program
  .command('optimize')
  .description('Analyze current usage and compare costs across all providers')
  .option('-m, --model <model>', 'Current model (e.g., claude-opus, gpt-4o)')
  .option('-d, --daily <number>', 'Messages per day', parseInt)
  .option('-t, --tokens <number>', 'Average tokens per message', parseInt)
  .action((options) => {
    const optimize = require('./commands/optimize');
    optimize(options);
  });

program
  .command('migrate')
  .description('Interactive migration wizard — switch providers safely')
  .option('-t, --target <provider>', 'Target provider (claude, openai, gemini)')
  .option('--dry-run', 'Preview migration without making changes')
  .action((options) => {
    const migrate = require('./commands/migrate');
    migrate(options);
  });

program
  .command('stats')
  .description('View usage statistics and cost tracking dashboard')
  .option('-p, --period <period>', 'Time period: daily, weekly, monthly', 'weekly')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const stats = require('./commands/stats');
    stats(options);
  });

program
  .command('rollback')
  .description('Rollback to a previous provider configuration')
  .option('-l, --list', 'List available backups')
  .action((options) => {
    const rollback = require('./commands/rollback');
    rollback(options);
  });

program
  .command('config')
  .description('View and manage settings')
  .argument('[action]', 'Action: show, set, reset', 'show')
  .argument('[key]', 'Config key to set')
  .argument('[value]', 'Value to set')
  .action((action, key, value) => {
    const config = require('./commands/config');
    config(action, key, value);
  });

program
  .command('upgrade')
  .description('Upgrade to Pro tier for hybrid routing and advanced features')
  .option('-k, --key <license>', 'Activate with license key')
  .action((options) => {
    const upgrade = require('./commands/upgrade');
    upgrade(options);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
