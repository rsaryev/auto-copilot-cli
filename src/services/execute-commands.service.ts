import chalk from 'chalk';
import { exec, ExecException } from 'child_process';
import logger from '../libs/logger';
import { ITask } from '../types';
import { questionExecuteTask } from '../utils';

class CommandExecutor {
  private static async runCommand(
    command: string,
    timeout = 10000,
  ): Promise<{
    result: string;
    error: string | null;
  }> {
    return new Promise((resolve) => {
      exec(
        command,
        { timeout },
        (error: ExecException | null, stdout: string, stderr: string) => {
          if (error) {
            resolve({ result: stdout, error: stderr });
          } else {
            resolve({ result: stdout, error: null });
          }
        },
      );
    });
  }

  async executeCommand(task: ITask, isAutoExecute: boolean): Promise<void> {
    if (task.type !== 'COMMAND') {
      return;
    }

    if (!isAutoExecute && !task.dangerous) {
      const confirmation = await questionExecuteTask(task.description);
      if (!confirmation) {
        logger.info(`Skipping: ${chalk.green(task.description)}`);
        return;
      }
    }

    if (task.dangerous) {
      const confirmation = await questionExecuteTask(
        `⚠️ Execute dangerous task: ${chalk.red(task.description)}`,
      );
      if (!confirmation) {
        logger.info(
          `Skipping dangerous task: ${chalk.green(task.description)}`,
        );
        return;
      }
    }

    const { error } = await CommandExecutor.runCommand(task.command!);
    if (error) {
      logger.error(`❌ ${task.description}`);
      return;
    }

    logger.info(`✅ ${task.description}`);
  }
}

export const executeCommandsService = new CommandExecutor();
