import { questionExecuteTask } from '../utils';
import logger from '../libs/logger';
import chalk from 'chalk';
import { ITask } from '../types';
import * as fs from 'fs';
import { executeCommand } from '../utils/command';

abstract class BaseExecuteService {
  private nextHandler: BaseExecuteService | null = null;
  async execute(task: ITask, isAutoExecute: boolean): Promise<void> {
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
  }
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
  async execute(task: ITask, isAutoExecute: boolean): Promise<void> {
    const { error } = await executeCommand(task.command!);
    if (error) {
      logger.error(`❌ ${task.description}`);
      return;
    }

    logger.info(`✅ ${task.description}`);
  }

  async handle(task: ITask, isAutoExecute: boolean): Promise<void> {
    await super.execute(task, isAutoExecute);
    if (task.type === 'COMMAND') {
      await this.execute(task, isAutoExecute);
      return;
    }
    return super.handle(task, isAutoExecute);
  }
}

class ExecuteWriteFileService extends BaseExecuteService {
  async execute(task: ITask, isAutoExecute: boolean): Promise<void> {
    fs.writeFileSync(task.path!, task.content!);
    logger.info(`✅ ${task.description}`);
  }
  async handle(task: ITask, isAutoExecute: boolean): Promise<void> {
    await super.execute(task, isAutoExecute);
    if (task.type === 'WRITE_FILE') {
      await this.execute(task, isAutoExecute);
      return;
    }
    return super.handle(task, isAutoExecute);
  }
}

const ex = new ExecuteCommandsService();
ex.setNext(new ExecuteCommandsService());
ex.setNext(new ExecuteWriteFileService());

export { ex };
