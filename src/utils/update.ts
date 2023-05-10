import fs from 'fs';
import path from 'path';
import { askUpdatePackage } from './inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { exec } from 'child_process';

export async function checkUpdate() {
  const { version, name } = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
  );
  const spinner = ora('Checking for updates').start();
  try {
    const response = await fetch(`https://registry.npmjs.org/${name}/latest`);
    const latestVersionNumber = (await response.json()).version;

    if (latestVersionNumber > version) {
      spinner.fail(
        chalk.yellow(
          `Please update ${name} manually by running: npm update -g ${name}`,
        ),
      );
    } else {
      spinner.succeed(
        chalk.green(`You are using the latest version of ${name}`),
      );
    }
  } catch (e) {
    spinner.fail();
  }
}
