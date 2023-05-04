import fs from 'fs';
import path from 'path';
import { Command, program } from 'commander';

export function initProgram(): Command {
  return program
    .option('-a, --auto-execute', 'Enable auto execute mode', false)
    .option('-m, --model <modelName>', 'OpenAI model name', 'gpt-3.5-turbo')
    .version(getVersions())
    .parse(process.argv);
}

export function getVersions(): string {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
  ).version;
}
