import { promisify } from 'util';
import chalk from 'chalk';
import { exec } from 'child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'process';

const runCommand = async (command: string) => {
  try {
    const { stdout, stderr } = await promisify(exec)(command);
    return { result: stdout, error: stderr };
  } catch (e: any) {
    return { result: '', error: e.stderr };
  }
};

const parseJson = (json: string): object | Array<any> | null => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

export const colorCommand = (command: string): string => {
  return chalk.green(command);
};

const rl = createInterface({ input, output });

export { runCommand, parseJson, rl };
