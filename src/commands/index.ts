import { IConfig } from '../types';
import { RefactorCommand } from './refactor';
import { ShellCommand } from './shell';

export class CommandService {
  private readonly config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  public async refactor(filePath: string, prompt?: string): Promise<void> {
    const refactorCommand = new RefactorCommand(this.config);
    await refactorCommand.execute(filePath, prompt);
  }

  public async shell(goal: string): Promise<void> {
    const shellCommand = new ShellCommand(this.config);
    await shellCommand.execute(goal);
  }
}
