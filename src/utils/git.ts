import simpleGit from 'simple-git';
import chalk from 'chalk';
import { excludePackagesFiles, extensions } from './language-extensions';
const git = simpleGit();

export async function checkGitExists() {
  const gitExists = await git.checkIsRepo();
  if (!gitExists) {
    console.error(`${chalk.red('✘')} need to be in a git repository`);
    process.exit(1);
  }
}

export async function getGitIgnoreFiles() {
  const gitIgnoreFiles = await git.raw(['ls-files', '--others', '--exclude-standard', '-i', '--directory', '--cached']);
  return gitIgnoreFiles.split('\n').filter(Boolean);
}

export async function gitDiffCommand() {
  const exts = Array.from(extensions.values(), (ext) => `*${ext}`);
  const excludeFiles = Array.from(excludePackagesFiles.values());
  const gitIgnoreFiles = await getGitIgnoreFiles();

  return git.diff([
    '--cached',
    '--diff-filter=ACMRT',
    '--',
    ...exts,
    ...excludeFiles.map((file) => `:(exclude)${file}`),
    ...gitIgnoreFiles.map((file) => `:(exclude)${file}`),
  ]);
}

export async function gitDiffFiles() {
  const exts = Array.from(extensions.values(), (ext) => `*${ext}`);
  const excludeFiles = Array.from(excludePackagesFiles.values());
  const gitIgnoreFiles = await getGitIgnoreFiles();

  const raw = await git.diff([
    '--name-only',
    '--cached',
    '--diff-filter=ACMRT',
    '--',
    ...exts,
    ...excludeFiles.map((file) => `:(exclude)${file}`),
    ...gitIgnoreFiles.map((file) => `:(exclude)${file}`),
  ]);

  return raw.split('\n').filter(Boolean);
}
