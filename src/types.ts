export interface IConfig {
  OPENAI_API_KEY: string;
  MAX_TOKENS: number;
  TEMPERATURE: number;
}

export interface ITask {
  type: 'COMMAND' | 'WRITE_FILE';
  command?: string;
  path?: string;
  content?: string;
  dangerous?: boolean;
  description: string;
}
