const chalk = require('chalk');
const Table = require('cli-table3');
const Conf = require('conf');

const store = new Conf({ projectName: 'openclaw-usage' });

const CONFIG_KEYS = {
  'budget.alert': {
    description: 'Monthly budget alert threshold (USD)',
    default: 100,
    type: 'number',
  },
  'budget.hard-limit': {
    description: 'Monthly hard spending limit (USD, 0 = disabled)',
    default: 0,
    type: 'number',
  },
  'tracking.enabled': {
    description: 'Enable automatic cost tracking',
    default: true,
    type: 'boolean',
  },
  'tracking.retention-days': {
    description: 'Days to keep tracking data',
    default: 90,
    type: 'number',
  },
  'default.provider': {
    description: 'Default provider for new sessions',
    default: 'anthropic',
    type: 'string',
  },
  'default.model': {
    description: 'Default model for new sessions',
    default: 'claude-sonnet',
    type: 'string',
  },
  'notifications.enabled': {
    description: 'Enable budget notifications',
    default: true,
    type: 'boolean',
  },
  'notifications.email': {
    description: 'Email for budget alerts (optional)',
    default: '',
    type: 'string',
  },
  'pro.license-key': {
    description: 'Pro tier license key',
    default: '',
    type: 'string',
  },
  'hybrid.budget-model': {
    description: 'Model for simple queries (Pro)',
    default: 'gemini-flash',
    type: 'string',
  },
  'hybrid.premium-model': {
    description: 'Model for complex queries (Pro)',
    default: 'claude-sonnet',
    type: 'string',
  },
  'hybrid.threshold': {
    description: 'Complexity threshold for routing (0-1, Pro)',
    default: 0.5,
    type: 'number',
  },
};

function config(action, key, value) {
  switch (action) {
    case 'show':
      showConfig(key);
      break;
    case 'set':
      setConfig(key, value);
      break;
    case 'reset':
      resetConfig(key);
      break;
    default:
      showConfig();
  }
}

function showConfig(filterKey) {
  console.log(chalk.bold.cyan('\n⚙️  Configuration\n'));

  const table = new Table({
    head: [chalk.cyan('Key'), chalk.cyan('Value'), chalk.cyan('Default'), chalk.cyan('Description')],
    colWidths: [28, 18, 12, 40],
    wordWrap: true,
  });

  for (const [key, meta] of Object.entries(CONFIG_KEYS)) {
    if (filterKey && !key.includes(filterKey)) continue;

    const configKey = `config.${key.replace(/\./g, '_')}`;
    const current = store.get(configKey, meta.default);
    const isDefault = current === meta.default;
    const isPro = key.startsWith('hybrid.') || key === 'pro.license-key';

    const valueStr = isPro && !isProUser()
      ? chalk.dim('(Pro only)')
      : isDefault
        ? chalk.dim(String(current))
        : chalk.white.bold(String(current));

    table.push([
      isPro ? chalk.magenta(key) : key,
      valueStr,
      chalk.dim(String(meta.default)),
      meta.description,
    ]);
  }

  console.log(table.toString());

  if (!isProUser()) {
    console.log(chalk.dim(`\n  ${chalk.magenta('Purple')} keys require Pro tier. Run "openclaw-usage upgrade" to unlock.\n`));
  }

  console.log(chalk.dim('  Set a value:   openclaw-usage config set <key> <value>'));
  console.log(chalk.dim('  Reset to default: openclaw-usage config reset <key>\n'));
}

function setConfig(key, value) {
  if (!key) {
    console.log(chalk.red('\n  Error: Please specify a key. Example: openclaw-usage config set budget.alert 150\n'));
    return;
  }

  if (value === undefined || value === null) {
    console.log(chalk.red('\n  Error: Please specify a value. Example: openclaw-usage config set budget.alert 150\n'));
    return;
  }

  const meta = CONFIG_KEYS[key];
  if (!meta) {
    console.log(chalk.red(`\n  Error: Unknown config key "${key}"\n`));
    console.log(chalk.dim('  Available keys:'));
    for (const k of Object.keys(CONFIG_KEYS)) {
      console.log(chalk.dim(`    ${k}`));
    }
    console.log('');
    return;
  }

  // Check Pro requirement
  if ((key.startsWith('hybrid.') || key === 'pro.license-key') && !isProUser() && key !== 'pro.license-key') {
    console.log(chalk.red(`\n  Error: "${key}" requires Pro tier.\n`));
    console.log(chalk.dim('  Run "openclaw-usage upgrade" to unlock Pro features.\n'));
    return;
  }

  // Type coercion
  let typedValue = value;
  if (meta.type === 'number') {
    typedValue = parseFloat(value);
    if (isNaN(typedValue)) {
      console.log(chalk.red(`\n  Error: "${key}" expects a number, got "${value}"\n`));
      return;
    }
  } else if (meta.type === 'boolean') {
    typedValue = value === 'true' || value === '1' || value === 'yes';
  }

  const configKey = `config.${key.replace(/\./g, '_')}`;
  store.set(configKey, typedValue);

  console.log(chalk.green(`\n  ✅ Set ${chalk.bold(key)} = ${chalk.bold(String(typedValue))}\n`));
}

function resetConfig(key) {
  if (!key) {
    // Reset all
    for (const k of Object.keys(CONFIG_KEYS)) {
      const configKey = `config.${k.replace(/\./g, '_')}`;
      store.delete(configKey);
    }
    console.log(chalk.green('\n  ✅ All settings reset to defaults.\n'));
    return;
  }

  const meta = CONFIG_KEYS[key];
  if (!meta) {
    console.log(chalk.red(`\n  Error: Unknown config key "${key}"\n`));
    return;
  }

  const configKey = `config.${key.replace(/\./g, '_')}`;
  store.delete(configKey);
  console.log(chalk.green(`\n  ✅ Reset ${chalk.bold(key)} to default (${meta.default})\n`));
}

function isProUser() {
  const licenseKey = store.get('config.pro_license-key', '');
  return licenseKey && licenseKey.length > 0;
}

module.exports = config;
