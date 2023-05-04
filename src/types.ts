export interface IConfig {
  OPENAI_API_KEY: string;
  MAX_TOKENS: number;
  TEMPERATURE: number;
}
export enum TaskType {
  COMMAND = 'COMMAND',
  WRITE_FILE = 'WRITE_FILE',
}

export interface BaseTask {
  type: TaskType;
  description: string;
  dangerous: boolean;
}

export interface CommandTask extends BaseTask {
  command: string;
}

export interface WriteFileTask extends BaseTask {
  path: string;
  content: string;
}

export type ITask = CommandTask | WriteFileTask;
