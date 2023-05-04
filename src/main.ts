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
import { initProgram } from './utils/program';

async function start({
  config,
  model,
  goal,
  isAutoExecute,
}: {
  config: IConfig;
  goal: string;
  model: string;
  isAutoExecute: boolean;
}): Promise<void> {
  try {
    goal = await rephraseGoal(goal, model);
    logger.info(`Rephrased: ${chalk.yellow(goal)}`);

    logger.info(`Planning tasks for goal: ${chalk.yellow(goal)}`);
    const tasks = await AIGenerateTasks(goal, model);
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
      await start({
        config,
        goal,
        isAutoExecute,
        model,
      });
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
        await start({
          config,
          goal,
          isAutoExecute,
          model,
        });
        return;
      }

      logger.error(err?.response?.data.error.message);
      return;
    }

    logger.error('Something went wrong!');
  }
}

export async function main() {
  const program = await initProgram();
  const config = await getConfig();
  const options = program.opts();
  const isAutoExecute = options.autoExecute;
  const model = options.model;
  const goal = program.args.join(' ').trim() || (await questionGoal());

  logger.info(`options: ${JSON.stringify(options)}`);
  await start({
    config,
    model,
    goal,
    isAutoExecute,
  });

  return readlineClose();
}
