import * as fs from 'fs';
import * as path from 'path';
import {IConfig} from '../types';

const configPath = path.join(__dirname, '../../config.json');

const defaultConfig: IConfig = {
    OPENAI_API_KEY: 'sk-xxx',
    TEMPERATURE: 0,
    MODEL: 'gpt-3.5-turbo-0613',
    EDITOR: 'code',
    OPEN_AI_BASE_URL: 'https://api.openai.com/v1',
    INCLUDE_COMMIT_DESCRIPTION: 'no',
    PACKAGE_MANAGER: 'brew',
};

export function setConfig(config: IConfig): void {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

// Set a specific configuration property by key
export function setConfigByKey<K extends keyof IConfig>(key: K, value: IConfig[K]): void {
    const config = getConfig();
    config[key] = value;
    setConfig(config);
}

export function getConfig(): IConfig {
    if (!fs.existsSync(configPath)) {
        setConfig(defaultConfig);
    }
    const existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!existingConfig.OPENAI_API_KEY) {
        existingConfig.OPENAI_API_KEY = defaultConfig.OPENAI_API_KEY;
        setConfig(existingConfig);
    }
    return {...defaultConfig, ...existingConfig};
}
