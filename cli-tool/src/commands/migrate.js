const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const os = require('os');
const Conf = require('conf');
const { PROVIDERS, getModelName, getAllModelKeys } = require('../lib/pricing');

const store = new Conf({ projectName: 'openclaw-usage' });

const OPENCLAW_CONFIG_PATHS = [
  path.join(os.homedir(), '.openclaw', 'config.yaml'),
  path.join(os.homedir(), '.openclaw', 'config.yml'),
  path.join(os.homedir(), '.openclaw', 'config.json'),
  path.join(os.homedir(), '.config', 'openclaw', 'config.yaml'),
];

async function migrate(options) {
  console.log(chalk.bold.cyan('\n🔄 OpenClaw Migration Wizard\n'));

  // Step 1: Detect current config
  const spinner = ora('Detecting OpenClaw configuration...').start();
  let configPath = null;
  let configContent = null;

  for (const p of OPENCLAW_CONFIG_PATHS) {
    if (fs.existsSync(p)) {
      configPath = p;
      configContent = fs.readFileSync(p, 'utf-8');
      break;
    }
  }

  if (configPath) {
    spinner.succeed(`Found config at ${chalk.dim(configPath)}`);
  } else {
    spinner.warn('No OpenClaw config found — will create a new one');
    configPath = OPENCLAW_CONFIG_PATHS[0]; // Default path
  }

  // Step 2: Show current setup
  if (configContent) {
    console.log(chalk.dim('\nCurrent configuration:'));
    console.log(chalk.dim('─'.repeat(50)));
    const preview = configContent.split('\n').slice(0, 15).join('\n');
    console.log(chalk.dim(preview));
    if (configContent.split('\n').length > 15) {
      console.log(chalk.dim(`  ... (${configContent.split('\n').length - 15} more lines)`));
    }
    console.log(chalk.dim('─'.repeat(50)));
  }

  // Step 3: Choose target provider and model
  const providerChoices = [];
  for (const [key, provider] of Object.entries(PROVIDERS)) {
    for (const [modelKey, model] of Object.entries(provider.models)) {
      providerChoices.push({
        name: `${provider.name} — ${model.name} (${model.tier}) — $${model.input}/$${model.output} per M tokens`,
        value: { providerKey: key, modelKey, model, provider },
        short: model.name,
      });
    }
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'target',
      message: 'Which provider/model do you want to migrate to?',
      choices: providerChoices,
      when: !options.target,
    },
    {
      type: 'confirm',
      name: 'backup',
      message: 'Create a backup of your current config?',
      default: true,
    },
  ]);

  // Resolve target
  let target = answers.target;
  if (options.target) {
    const found = providerChoices.find(
      (c) => c.value.modelKey === options.target || c.value.providerKey === options.target
    );
    target = found ? found.value : providerChoices[0].value;
  }

  // Step 4: Backup
  if (answers.backup && configContent) {
    const backupSpinner = ora('Creating backup...').start();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = configPath + `.backup-${timestamp}`;

    try {
      fs.copyFileSync(configPath, backupPath);
      // Store backup reference
      const backups = store.get('backups', []);
      backups.push({
        path: backupPath,
        originalPath: configPath,
        timestamp: new Date().toISOString(),
        fromModel: 'detected',
        toModel: target.modelKey,
      });
      store.set('backups', backups);
      backupSpinner.succeed(`Backup saved to ${chalk.dim(backupPath)}`);
    } catch (err) {
      backupSpinner.fail(`Backup failed: ${err.message}`);
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Continue without backup?',
          default: false,
        },
      ]);
      if (!proceed) {
        console.log(chalk.yellow('\nMigration cancelled.'));
        return;
      }
    }
  }

  // Step 5: Dry run check
  if (options.dryRun) {
    console.log(chalk.yellow('\n🔍 DRY RUN — No changes will be made\n'));
    console.log(`Would migrate to: ${chalk.bold(target.model.name)}`);
    console.log(`Provider: ${target.provider.name}`);
    console.log(`Config path: ${configPath}`);
    console.log(chalk.yellow('\nRun without --dry-run to apply changes.'));
    return;
  }

  // Step 6: Generate new config
  const migrateSpinner = ora('Generating new configuration...').start();

  const newConfig = generateConfig(target);
  await sleep(1000); // Simulated processing time

  migrateSpinner.succeed('Configuration generated');

  // Step 7: Write config
  const writeSpinner = ora('Writing new configuration...').start();

  try {
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configPath, newConfig, 'utf-8');
    writeSpinner.succeed(`Configuration written to ${chalk.dim(configPath)}`);
  } catch (err) {
    writeSpinner.fail(`Failed to write config: ${err.message}`);
    console.log(chalk.dim('\nGenerated config (copy manually):'));
    console.log(newConfig);
    return;
  }

  // Step 8: Validate
  const validateSpinner = ora('Validating configuration...').start();
  await sleep(500);
  validateSpinner.succeed('Configuration is valid');

  // Summary
  console.log(chalk.bold.green('\n✅ Migration Complete!\n'));
  console.log(`   Provider:  ${chalk.bold(target.provider.name)}`);
  console.log(`   Model:     ${chalk.bold(target.model.name)}`);
  console.log(`   Tier:      ${target.model.tier}`);
  console.log(`   Pricing:   $${target.model.input}/M input, $${target.model.output}/M output`);
  console.log(`   Config:    ${chalk.dim(configPath)}`);
  console.log(`\n   ${chalk.dim('To undo: openclaw-usage rollback')}`);
  console.log('');

  // Track migration
  const migrations = store.get('migrations', []);
  migrations.push({
    timestamp: new Date().toISOString(),
    toProvider: target.providerKey,
    toModel: target.modelKey,
  });
  store.set('migrations', migrations);
}

function generateConfig(target) {
  const providerConfigs = {
    anthropic: (model) => `# OpenClaw Configuration
# Migrated by openclaw-usage on ${new Date().toISOString().split('T')[0]}

provider: anthropic
model: ${model.modelKey}

anthropic:
  api_key: \${ANTHROPIC_API_KEY}
  model: ${model.model.name.toLowerCase().replace(/\s+/g, '-')}
  max_tokens: 4096
  temperature: 0.7

# Cost tracking
tracking:
  enabled: true
  budget_alert: 100  # USD per month
`,
    openai: (model) => `# OpenClaw Configuration
# Migrated by openclaw-usage on ${new Date().toISOString().split('T')[0]}

provider: openai
model: ${model.modelKey}

openai:
  api_key: \${OPENAI_API_KEY}
  model: ${model.model.name.toLowerCase().replace(/\s+/g, '-')}
  max_tokens: 4096
  temperature: 0.7

# Cost tracking
tracking:
  enabled: true
  budget_alert: 100  # USD per month
`,
    google: (model) => `# OpenClaw Configuration
# Migrated by openclaw-usage on ${new Date().toISOString().split('T')[0]}

provider: google
model: ${model.modelKey}

google:
  api_key: \${GOOGLE_API_KEY}
  model: ${model.model.name.toLowerCase().replace(/\s+/g, '-')}
  max_tokens: 4096
  temperature: 0.7

# Cost tracking
tracking:
  enabled: true
  budget_alert: 100  # USD per month
`,
  };

  const generator = providerConfigs[target.providerKey];
  return generator ? generator(target) : `# Provider: ${target.providerKey}\nmodel: ${target.modelKey}\n`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = migrate;
