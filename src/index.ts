import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import os from 'os';
import { handleCommandAction } from './commands';
import { version } from '../package.json';
import { ICommandArgs } from './types';

export const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto_copilot_cli'));

const program = new Command();
program
  .option('-m, --model <modelName>', 'Set OpenAI model name')
  .option('-k, --openai-api-key <key>', 'Set OpenAI API key')
  .option('-e, --editor <editor>', 'Set editor to open files')
  .option('-r, --refactor <file>', 'Refactor code beta')
  .option('-p, --prompt <prompt>', 'Prompt for AI')
  .option('-b, --base-url <url>', 'Set OpenAI base url')
  .option('-c, --chat', 'chat with AI')
  .option('--exec <command>', 'Execute a command and analyze it for errors')
  .version(version)
  .action((args: ICommandArgs) => handleCommandAction(args, program))
  .parse(process.argv);
