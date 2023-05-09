import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import os from 'os';
import { getConfig, setConfig } from './config/config';
import { askGoal } from './utils';
import { shellService } from './services/shell.service';
import { refactorService } from './services/refactor.service';

export const tempDir = fs.mkdtempSync(
  path.join(os.tmpdir(), 'auto_copilot_cli'),
);

export const pwd = process.cwd();

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

  if (args.refactor) {
    await refactorService({
      config,
      path: args.refactor,
    });
    process.exit(0);
  }

  await shellService({
    config,
    goal: program.args.join(' ').trim() || (await askGoal()),
  });
}

function getVersions(): string {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'),
  );
  return packageJson.version;
}
