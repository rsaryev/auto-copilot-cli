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
  try {
    const response = await fetch(`https://registry.npmjs.org/${name}/latest`);
    const latestVersionNumber = (await response.json()).version;

    if (latestVersionNumber > version) {
      const shouldUpdate = await askUpdatePackage();
      const spinner = ora('Updating...').start();
      if (shouldUpdate) {
        exec(`npm i -g ${name + 1}`, (err) => {
          if (err) {
            spinner.fail(
              chalk.yellow(
                `Failed updates. Please check manually by running: npm i -g ${name}`,
              ),
            );
            return;
          } else {
            spinner.succeed(chalk.green('Updated successfully!'));
          }
        });
      } else {
        spinner.succeed(
          chalk.yellow(
            `Please update ${name} manually by running: npm i -g ${name}`,
          ),
        );
      }
    }
  } catch (e) {
    console.log(
      chalk.yellow(
        `Failed to check for updates. Please check manually by running: npm i -g ${name}`,
      ),
    );
  }
}
