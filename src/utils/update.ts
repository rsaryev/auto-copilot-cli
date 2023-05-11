import ora from 'ora';
import { exec } from 'child_process';
import semver from 'semver';
import chalk from 'chalk';
// @ts-ignore
import { version, name } from '../../package.json';
import { promisify } from 'util';

export async function checkUpdate() {
  const spinner = ora('Checking for updates').start();
  const execPromise = promisify(exec);
  const { stdout } = await execPromise('npm view auto-copilot-cli version');
  const latestVersion = semver.clean(stdout);
  if (!latestVersion) {
    spinner.fail(chalk.yellow('Could not check for updates'));
    return;
  }
  if (semver.gt(latestVersion, version)) {
    spinner.fail(
      chalk.yellow(`Please update ${name} to the latest version: ${chalk.blue('npm i -g auto-copilot-cli')}`),
    );
  } else {
    spinner.succeed(chalk.green(`You are using the latest version of ${name}`));
  }
}
