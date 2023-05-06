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
  description: string;
  dangerous: boolean;
}

export interface CommandTask extends BaseTask {
  type: TaskType.COMMAND;
  command: string;
}

export interface WriteFileTask extends BaseTask {
  path: string;
  type: TaskType.WRITE_FILE;
  content: string;
}

export type ITask = CommandTask | WriteFileTask;
