import ora from 'ora';
import { exec } from 'child_process';
import chalk from 'chalk';
import { spawn } from 'child_process';
import simpleGit from 'simple-git';
import { excludePackagesFiles, extensions, filterFilesByExtensions } from './language-extensions';

export const exFunction = async <T>(fn: () => Promise<T>, message: string, successMessage: string): Promise<T> => {
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

export function executeShell(command: string) {
  return new Promise((resolve) => {
    const child = spawn(command, [], { shell: true });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.stdin.pipe(process.stdin);
    process.stdin.pipe(child.stdin);

    child.on('close', (code) => {
      resolve(code);
    });
  });
}

export function checkNodeVersion() {
  const nodeVersion = process.versions.node.split('.')[0];
  if (Number(nodeVersion) < 18) {
    console.log(`${chalk.red('✘')} Please update your node version to 18 or above\nCurrent version: ${nodeVersion}`);
    process.exit(1);
  }
}

export async function checkGitExists() {
  const gitExists = await simpleGit().checkIsRepo();
  if (!gitExists) {
    console.error(`${chalk.red('✘')} need to be in a git repository`);
    process.exit(1);
  }
}

export const prepareGitDiffCommand = () => {
  const exts = [...extensions.values()].map((ext) => `*${ext}`);
  const excludeFiles = [...excludePackagesFiles.values()];

  return simpleGit().diff([
    '--cached',
    '--diff-filter=ACMRT',
    '--',
    ...exts,
    ...excludeFiles.map((file) => `:(exclude)${file}`),
  ]);
};

// git diff --name-only --cached
export const prepareGitDiffFiles = async () => {
  const exts = [...extensions.values()].map((ext) => `*${ext}`);
  const excludeFiles = [...excludePackagesFiles.values()];

  return simpleGit().diff([
    '--name-only',
    '--cached',
    '--diff-filter=ACMRT',
    '--',
    ...exts,
    ...excludeFiles.map((file) => `:(exclude)${file}`),
  ]);
};
