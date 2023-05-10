import { IConfig } from '../types';
import { Refactor } from './refactor';
import { Shell } from './shell';

export class CommandService {
  private readonly config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  public async refactor(filePath: string, prompt?: string): Promise<void> {
    return new Refactor(this.config).executeCommand(filePath, prompt);
  }

  public async shell(goal: string): Promise<void> {
    return new Shell(this.config).executeCommand(goal);
  }
}
