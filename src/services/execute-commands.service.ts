import chalk from 'chalk';
import { promisify } from 'util';
import { exec } from 'child_process';
import { questionExecuteCommand, questionFixCommand } from '../utils';
import logger from '../libs/logger';
import { fixErrorCommands } from './commands.service';

class ExecuteCommandsService {
  private static instance: ExecuteCommandsService;
  static getInstance() {
    if (!ExecuteCommandsService.instance) {
      ExecuteCommandsService.instance = new ExecuteCommandsService();
    }
    return ExecuteCommandsService.instance;
  }

  private async runCommand(command: string) {
    try {
      const { stdout, stderr } = await promisify(exec)(command);
      return { result: stdout, error: stderr };
    } catch (e: any) {
      return { result: '', error: e.stderr };
    }
  }

  async executeCommands(
    commands: string | string[],
    isAutoExecute: boolean,
  ): Promise<void> {
    const commandQueue = commands instanceof Array ? commands : [commands];
    for (const command of commandQueue) {
      const commandSmall = command.trim().replace(/\n/g, '').substring(0, 50);
      if (!isAutoExecute) {
        const confirmation = await questionExecuteCommand(commandSmall);
        if (!confirmation) {
          logger.info(`Skipping command: ${chalk.green(commandSmall)}`);
          return;
        }
      }

      const { result, error } = await this.runCommand(command);
      if (error) {
        logger.error(
          `Command: ${chalk.green(commandSmall)} executed with error: ${error}`,
        );

        if (!isAutoExecute) {
          const confirmation = await questionFixCommand(commandSmall);
          if (!confirmation) {
            logger.info(`Skipping fix command: ${chalk.green(commandSmall)}`);
            return;
          }
        }

        const fixedCommand = await fixErrorCommands(command, error);
        await this.executeCommands(fixedCommand, isAutoExecute);
      }
      logger.info(
        `Command: ${chalk.green(
          commandSmall,
        )} executed successfully with result: ${result}`,
      );
    }
  }
}

export const executeCommandsService = ExecuteCommandsService.getInstance();
