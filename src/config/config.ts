import * as fs from 'fs';
import * as path from 'path';
import { IConfig } from '../types';
import { questionOpenAIKey } from '../utils';

const configPath = path.join(__dirname, '../../config.json');
export function setConfig(config: IConfig): void {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}
export const getConfig: () => Promise<IConfig> = async (): Promise<IConfig> => {
  const defaultConfig: Omit<IConfig, 'OPENAI_API_KEY'> = {
    TEMPERATURE: 0,
    MAX_TOKENS: 150,
  };

  const config =
    JSON.parse(fs.readFileSync(configPath, 'utf8')) || defaultConfig;
  if (!config.OPENAI_API_KEY) {
    config.OPENAI_API_KEY = await questionOpenAIKey();
  }

  await setConfig(config);
  return config;
};
