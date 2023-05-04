import chalk from 'chalk';
import axios from 'axios';

import { getConfig, setConfig } from './config/config';
import {
  questionApprovePlan,
  questionGoal,
  questionOpenAIKey,
  readlineClose,
} from './utils';
import { CommandTask, IConfig, TaskType } from './types';
import logger from './libs/logger';
import { AIGenerateTasks, rephraseGoal } from './services/openai.service';
import { ex } from './services/execute.service';

async function start(
  config: IConfig,
  goal: string,
  isAutoExecute: boolean,
): Promise<void> {
  try {
    goal = await rephraseGoal(goal);
    logger.info(`Rephrased: ${chalk.yellow(goal)}`);

    logger.info(`Planning tasks for goal: ${chalk.yellow(goal)}`);
    const tasks = await AIGenerateTasks(goal);
    if (tasks.length === 0) {
      logger.info(`No tasks found for goal: ${chalk.yellow(goal)}`);
      await readlineClose();
      return;
    }

    const plan = tasks
      .map((task, i) => {
        if (task.type === TaskType.COMMAND) {
          const commandTask = task as CommandTask;
          return `${i + 1}. ${chalk.green(commandTask.command)} | ${
            commandTask.type
          } | ${
            commandTask.dangerous ? chalk.red('dangerous') : chalk.green('safe')
          }`;
        } else {
          return `${i + 1}. ${task.description} | ${task.type} | ${
            task.dangerous ? chalk.red('dangerous') : chalk.green('safe')
          }`;
        }
      })
      .join('\n');

    logger.info(`Tasks for goal: ${chalk.yellow(goal)}\n${plan}`);
    const isApproved = await questionApprovePlan();
    if (!isApproved) {
      await start(config, goal, isAutoExecute);
      return;
    }

    for (const task of tasks) {
      logger.info(`Executing task: ${chalk.yellow(task.description)}`);
      await ex.handle(task, isAutoExecute);
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
  const isAutoExecute = process.argv.includes('--a') || false;
  const goal =
    process.argv.slice(2).join(' ').replace('--a', '').trim() ||
    (await questionGoal());

  await start(config, goal, isAutoExecute);

  return readlineClose();
}
