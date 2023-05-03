import chalk from 'chalk';
import axios from 'axios';

import { getConfig, setConfig } from './config/config';
import {
  questionApprovePlan,
  questionAutoExecuteTasks,
  questionGoal,
  questionOpenAIKey,
  readlineClose,
} from './utils';
import { IConfig } from './types';
import logger from './libs/logger';
import { AIGenerateTasks, rephraseGoal } from './utils/openai';
import { executeCommandsService } from './services/execute-commands.service';

async function start(
  config: IConfig,
  goal: string,
  isAutoExecute: boolean,
): Promise<void> {
  try {
    goal = await rephraseGoal(goal);
    logger.info(`Rephrased goal: ${chalk.yellow(goal)}`);

    const tasks = await AIGenerateTasks(goal);
    if (tasks.length === 0) {
      logger.info(`No tasks found for goal: ${chalk.yellow(goal)}`);
      await readlineClose();
      return;
    }

    logger.info(
      `Planning: \n${tasks
        .map(
          ({ command, description, type, dangerous }, index) =>
            `${index + 1}. ${
              tasks.length > 50 ? '' : command ? chalk.yellow(command) : ''
            } ${description} | ${type} | ${
              dangerous ? chalk.red('dangerous') : chalk.green('safe')
            }`,
        )
        .join('\n')}`,
    );

    const isApproved = await questionApprovePlan();
    if (!isApproved) {
      await start(config, goal, isAutoExecute);
      return;
    }

    for (const task of tasks) {
      logger.info(`Executing task: ${chalk.yellow(task.description)}`);
      await executeCommandsService.executeCommand(task, isAutoExecute);
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        config.OPENAI_API_KEY = await questionOpenAIKey();
        setConfig(config);
        await start(config, goal, isAutoExecute);
        return;
      }
    }

    console.log(err);
    logger.error(chalk.red(err));
  }
}

export async function main() {
  const config = await getConfig();
  const goal = process.argv.slice(2).join(' ') || (await questionGoal());
  const isAutoExecute = await questionAutoExecuteTasks();
  await start(config, goal, isAutoExecute);

  return readlineClose();
}
