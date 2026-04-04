const chalk = require('chalk');
const Table = require('cli-table3');
const inquirer = require('inquirer');
const Conf = require('conf');

const store = new Conf({ projectName: 'openclaw-usage' });

async function upgrade(options) {
  console.log(chalk.bold.cyan('\n⭐ OpenClaw Usage — Pro Tier\n'));

  // Check if already Pro
  const currentKey = store.get('config.pro_license-key', '');
  if (currentKey) {
    console.log(chalk.green('  ✅ You are on the Pro tier!\n'));
    console.log(`     License: ${chalk.dim(currentKey.substring(0, 8) + '...')}`);
    console.log(`     Status:  ${chalk.green('Active')}\n`);

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'View Pro features', value: 'features' },
          { name: 'Change license key', value: 'change' },
          { name: 'Deactivate Pro', value: 'deactivate' },
          { name: 'Cancel', value: 'cancel' },
        ],
      },
    ]);

    if (action === 'deactivate') {
      store.delete('config.pro_license-key');
      console.log(chalk.yellow('\n  Pro tier deactivated. You\'re back on the free tier.\n'));
    } else if (action === 'change') {
      await activateLicense();
    } else if (action === 'features') {
      showFeatures();
    }
    return;
  }

  // Handle direct key activation
  if (options.key) {
    await activateLicense(options.key);
    return;
  }

  // Show comparison
  showFeatures();

  // Prompt for action
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '🔑 Enter a license key', value: 'activate' },
        { name: '🛒 Purchase Pro ($9/month)', value: 'purchase' },
        { name: '❌ Maybe later', value: 'cancel' },
      ],
    },
  ]);

  if (action === 'activate') {
    await activateLicense();
  } else if (action === 'purchase') {
    console.log(chalk.bold('\n  🛒 Purchase Pro\n'));
    console.log('     Visit: ' + chalk.underline.blue('https://openclaw-usage.gumroad.com/l/pro'));
    console.log('     Price: $9/month (cancel anytime)');
    console.log('     Payment: Credit card or PayPal via Gumroad\n');
    console.log(chalk.dim('     After purchase, you\'ll receive a license key via email.'));
    console.log(chalk.dim('     Activate it with: openclaw-usage upgrade --key YOUR_KEY\n'));
  }
}

function showFeatures() {
  console.log(chalk.bold('  Free vs Pro Comparison\n'));

  const table = new Table({
    head: [chalk.cyan('Feature'), chalk.white('Free'), chalk.magenta('Pro ($9/mo)')],
    colWidths: [35, 20, 20],
  });

  const features = [
    ['Cost analysis & comparison', chalk.green('✓'), chalk.green('✓')],
    ['Single-provider migration', chalk.green('✓'), chalk.green('✓')],
    ['Configuration rollback', chalk.green('✓'), chalk.green('✓')],
    ['7-day cost tracking', chalk.green('✓'), chalk.green('✓')],
    ['Basic settings', chalk.green('✓'), chalk.green('✓')],
    ['', '', ''],
    ['Hybrid multi-provider routing', chalk.red('✗'), chalk.green('✓')],
    ['Unlimited cost tracking', chalk.red('✗'), chalk.green('✓')],
    ['Custom routing rules', chalk.red('✗'), chalk.green('✓')],
    ['Budget alerts & notifications', chalk.red('✗'), chalk.green('✓')],
    ['Advanced analytics', chalk.red('✗'), chalk.green('✓')],
    ['Priority support', chalk.red('✗'), chalk.green('✓')],
    ['Export reports (CSV/PDF)', chalk.red('✗'), chalk.green('✓')],
  ];

  for (const row of features) {
    table.push(row);
  }

  console.log(table.toString());

  // Value proposition
  console.log(chalk.bold('\n  💰 Why Pro Pays for Itself\n'));
  console.log('     Average savings with hybrid routing: $52/month');
  console.log('     Pro cost:                            $9/month');
  console.log('     ' + chalk.green.bold('Net savings:                           $43/month'));
  console.log('     ' + chalk.green('ROI: 478%'));
  console.log('');
}

async function activateLicense(key) {
  if (!key) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'key',
        message: 'Enter your Pro license key:',
        validate: (input) => {
          if (!input || input.trim().length < 8) {
            return 'License key must be at least 8 characters';
          }
          return true;
        },
      },
    ]);
    key = answers.key.trim();
  }

  // Validate license key format
  const isValid = validateLicenseKey(key);

  if (isValid) {
    store.set('config.pro_license-key', key);
    console.log(chalk.bold.green('\n  ✅ Pro tier activated!\n'));
    console.log('     You now have access to:');
    console.log('     • Hybrid multi-provider routing');
    console.log('     • Unlimited cost tracking');
    console.log('     • Budget alerts & notifications');
    console.log('     • Custom routing rules');
    console.log('     • Advanced analytics');
    console.log('     • Priority support');
    console.log(`\n     ${chalk.dim('Configure hybrid routing: openclaw-usage config set hybrid.threshold 0.5')}\n`);
  } else {
    console.log(chalk.red('\n  ❌ Invalid license key.\n'));
    console.log(chalk.dim('     Please check your key and try again.'));
    console.log(chalk.dim('     Purchase a key at: https://openclaw-usage.gumroad.com/l/pro\n'));
  }
}

function validateLicenseKey(key) {
  // Basic format validation
  // In production, this would verify against a license server
  if (!key || key.length < 8) return false;

  // Accept any key that matches pattern: XXXX-XXXX-XXXX-XXXX or is 16+ chars
  const dashPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
  const longPattern = /^[A-Za-z0-9]{16,}$/;

  return dashPattern.test(key) || longPattern.test(key);
}

module.exports = upgrade;
