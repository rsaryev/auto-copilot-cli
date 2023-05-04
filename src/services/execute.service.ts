import { questionExecuteDangerousTask, questionExecuteTask } from '../utils';
import logger from '../libs/logger';
import chalk from 'chalk';
import { CommandTask, ITask, TaskType, WriteFileTask } from '../types';
import * as fs from 'fs';
import { executeCommand } from '../utils/command';

abstract class BaseExecuteService {
  private nextHandler: BaseExecuteService | null = null;
  setNext(handler: BaseExecuteService): BaseExecuteService {
    this.nextHandler = handler;
    return handler;
  }

  async handle(task: ITask, isAutoExecute: boolean): Promise<void> {
    if (this.nextHandler) {
      await this.nextHandler.handle(task, isAutoExecute);
    }
  }
}

class ExecuteCommandsService extends BaseExecuteService {
  async execute(task: CommandTask, isAutoExecute: boolean): Promise<void> {
    if (!isAutoExecute) {
      const question = task.dangerous
        ? questionExecuteDangerousTask
        : questionExecuteTask;
      const confirmation = await question(task.description);
      if (!confirmation) {
        logger.warn(`Skipping: ${chalk.green(task.description)}`);
        return;
      }
    }

    const { error } = await executeCommand(task.command!);
    if (error) {
      logger.error(`❌ ${task.description}: ${error}`);
      return;
    }

    logger.info(`✅ ${task.description}`);
  }

  async handle(task: ITask, isAutoExecute: boolean): Promise<void> {
    if (task.type === TaskType.COMMAND) {
      await this.execute(task as CommandTask, isAutoExecute);
      return;
    }
    return super.handle(task, isAutoExecute);
  }
}

class ExecuteWriteFileService extends BaseExecuteService {
  async execute(task: WriteFileTask, isAutoExecute: boolean): Promise<void> {
    if (!isAutoExecute) {
      const question = task.dangerous
        ? questionExecuteDangerousTask
        : questionExecuteTask;
      const confirmation = await question(task.description);
      if (!confirmation) {
        logger.info(`Skipping: ${chalk.green(task.description)}`);
        return;
      }
    }

    fs.writeFileSync(task.path!, task.content!);
    logger.info(`✅ ${task.description}`);
  }
  async handle(task: ITask, isAutoExecute: boolean): Promise<void> {
    if (task.type === TaskType.WRITE_FILE) {
      await this.execute(task as WriteFileTask, isAutoExecute);
      return;
    }
    return super.handle(task, isAutoExecute);
  }
}

const ex = new ExecuteCommandsService();
ex.setNext(new ExecuteWriteFileService());

export { ex };
