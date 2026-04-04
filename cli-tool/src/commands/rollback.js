const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const fs = require('fs');
const Conf = require('conf');

const store = new Conf({ projectName: 'openclaw-usage' });

async function rollback(options) {
  console.log(chalk.bold.cyan('\n⏪ Configuration Rollback\n'));

  const backups = store.get('backups', []);

  if (backups.length === 0) {
    console.log(chalk.yellow('  No backups found.\n'));
    console.log(chalk.dim('  Backups are created automatically when you run "openclaw-usage migrate".'));
    console.log(chalk.dim('  Run a migration first to create a backup.\n'));
    return;
  }

  // List backups
  if (options.list) {
    console.log(chalk.bold('  Available Backups:\n'));
    for (let i = 0; i < backups.length; i++) {
      const b = backups[i];
      const exists = fs.existsSync(b.path);
      const status = exists ? chalk.green('✓') : chalk.red('✗ missing');
      console.log(`  ${chalk.dim(`[${i + 1}]`)} ${b.timestamp}  →  ${b.toModel || 'unknown'}`);
      console.log(`      ${chalk.dim(b.path)} ${status}`);
    }
    console.log('');
    return;
  }

  // Filter to existing backups
  const validBackups = backups.filter((b) => fs.existsSync(b.path));

  if (validBackups.length === 0) {
    console.log(chalk.red('  All backup files are missing.\n'));
    return;
  }

  // Let user pick
  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: 'Which backup do you want to restore?',
      choices: validBackups.map((b, i) => ({
        name: `${b.timestamp} — migrated to ${b.toModel || 'unknown'}`,
        value: b,
      })),
    },
  ]);

  // Confirm
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Restore config from ${selected.timestamp}? This will overwrite your current config.`,
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow('\n  Rollback cancelled.\n'));
    return;
  }

  // Perform rollback
  const spinner = ora('Restoring configuration...').start();

  try {
    const backupContent = fs.readFileSync(selected.path, 'utf-8');
    fs.writeFileSync(selected.originalPath, backupContent, 'utf-8');
    spinner.succeed('Configuration restored');

    console.log(chalk.bold.green('\n  ✅ Rollback complete!\n'));
    console.log(`     Restored from: ${chalk.dim(selected.path)}`);
    console.log(`     Written to:    ${chalk.dim(selected.originalPath)}`);
    console.log(`     Timestamp:     ${selected.timestamp}`);
    console.log('');
  } catch (err) {
    spinner.fail(`Rollback failed: ${err.message}`);
  }
}

module.exports = rollback;
