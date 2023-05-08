import fs from 'fs';
import path from 'path';
import { Command, program } from 'commander';
import { getConfig, setConfig } from '../config/config';
import os from 'os';

export const tempDir = fs.mkdtempSync(
  path.join(os.tmpdir(), 'auto_copilot_cli'),
);

export function initProgram(): Command {
  return program
    .option('-a, --auto-execute', 'Enable auto execute mode', false)
    .option('-m, --model <modelName>', 'OpenAI model name', 'gpt-3.5-turbo')
    .option('--openai-api-key <key>', 'Set OpenAI API key')
    .action((args) => {
      const config = getConfig();
      if (args.openaiApiKey) {
        config.OPENAI_API_KEY = args.openaiApiKey;
        setConfig(config);
        process.exit(0);
      }
    })
    .version(getVersions())
    .parse(process.argv);
}

export function getVersions(): string {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
  ).version;
}
