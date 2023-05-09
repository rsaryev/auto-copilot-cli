import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import os from 'os';
import { getConfig, setConfig } from './config/config';
import { askGoal, askOpenAIKey } from './utils';
import { CommandService } from './services/commands.services';
import axios, { AxiosError } from 'axios';
import chalk from 'chalk';

const nodeVersion = process.versions.node.split('.')[0];
if (Number(nodeVersion) < 18) {
  console.log(
    `${chalk.red('✘')} Please update your node version to 18 or above`,
  );
  process.exit(1);
}

export const tempDir = fs.mkdtempSync(
  path.join(os.tmpdir(), 'auto_copilot_cli'),
);

const program = new Command();
program
  .option('-m, --model <modelName>', 'Set OpenAI model name')
  .option('-k, --openai-api-key <key>', 'Set OpenAI API key')
  .option('-e, --editor <editor>', 'Set editor to open files')
  .option('-r, --refactor <file>', 'Refactor code beta')
  .version(getVersions())
  .action(commandAction)
  .parse(process.argv);

async function commandAction(args: {
  autoExecute: boolean;
  model: string;
  openaiApiKey: string;
  editor: string;
  refactor: string;
}) {
  const config = getConfig();
  const service = new CommandService(config);

  if (args.openaiApiKey) {
    config.OPENAI_API_KEY = args.openaiApiKey;
    setConfig(config);
    process.exit(0);
  }

  if (args.model) {
    config.MODEL = args.model;
    setConfig(config);
    process.exit(0);
  }

  if (args.editor) {
    config.EDITOR = args.editor;
    setConfig(config);
    process.exit(0);
  }

  try {
    if (args.refactor) {
      await service.refactor(args.refactor);
      process.exit(0);
    }

    const goal = program.args.join(' ').trim() || (await askGoal());
    await service.shell(goal);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if ((error as AxiosError).response?.status === 401) {
        config.OPENAI_API_KEY = await askOpenAIKey();
        setConfig(config);
        await commandAction(args);
        return;
      }
    }
    console.log(
      `${chalk.red('✘')} ${
        error.response?.data?.error?.message || error.message
      }`,
    );
  }
}

function getVersions(): string {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'),
  );
  return packageJson.version;
}
