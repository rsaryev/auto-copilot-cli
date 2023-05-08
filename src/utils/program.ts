import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { getConfig, setConfig } from '../config/config';
import os from 'os';

export const tempDir = fs.mkdtempSync(
  path.join(os.tmpdir(), 'auto_copilot_cli'),
);

export function initProgram(): Command {
  const program = new Command();
  program
    .option('-a, --auto-execute', 'Enable auto execute mode', false)
    .option('-m, --model <modelName>', 'Set OpenAI model name')
    .option('-k, --openai-api-key <key>', 'Set OpenAI API key')
    .version(getVersions())
    .action(commandAction)
    .parse(process.argv);

  return program;
}

function commandAction(args: {
  autoExecute: boolean;
  model: string;
  openaiApiKey: string;
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
}

function getVersions(): string {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
  );
  return packageJson.version;
}
