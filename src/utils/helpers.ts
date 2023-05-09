import ora from 'ora';
import { exec } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export const exFunction = async <T>(
  fn: () => Promise<T>,
  message: string,
  successMessage: string,
): Promise<T> => {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.succeed(successMessage);
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  }
};

export function executeCommand(command: string) {
  return new Promise((resolve) => {
    const child = exec(command);
    child.stdout?.on('data', (data) => {
      process.stdout.write(data);
    });

    child.stderr?.on('data', (data) => {
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      resolve(code);
    });
  });
}

export function checkNodeVersion() {
  const nodeVersion = process.versions.node.split('.')[0];
  if (Number(nodeVersion) < 18) {
    console.log(
      `${chalk.red(
        '✘',
      )} Please update your node version to 18 or above\nCurrent version: ${nodeVersion}`,
    );
    process.exit(1);
  }
}
