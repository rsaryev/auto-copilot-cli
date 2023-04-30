import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { IConfig } from './types';
import { rl } from './utlis';

const configPath = path.join(__dirname, '..', 'config.json');

export function setConfig(config: IConfig): void {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}
export const getConfig: () => Promise<IConfig> = async (): Promise<IConfig> => {
  const defaultConfig: Omit<IConfig, 'OPENAI_API_KEY'> = {
    TEMPERATURE: 0.9,
    MAX_TOKENS: 150,
  };

  const config =
    JSON.parse(fs.readFileSync(configPath, 'utf8')) || defaultConfig;
  if (!config.OPENAI_API_KEY) {
    console.log(
      chalk.yellow(
        `OpenAI API key not found. Please create an OpenAI account and get your API key from https://platform.openai.com/account/api-keys`,
      ),
    );
    config.OPENAI_API_KEY = await rl.question('Input your OpenAI API key: ');
  }

  await setConfig(config);
  return config;
};
