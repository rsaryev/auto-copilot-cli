import * as fs from 'fs';
import * as path from 'path';
import { IConfig } from '../types';

const configPath = path.join(__dirname, '../../config.json');

export function setConfig(config: IConfig): void {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

export const getConfig = (): IConfig => {
  if (!fs.existsSync(configPath)) {
    setConfig({
      OPENAI_API_KEY: 'sk-xxx',
      TEMPERATURE: 0,
      MODEL: 'gpt-3.5-turbo',
      EDITOR: 'code',
      OPEN_AI_BASE_URL: 'https://api.openai.com/v1',
    });
  }

  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
};
