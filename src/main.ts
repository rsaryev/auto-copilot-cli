import chalk from 'chalk';
import axios from 'axios';
import { getConfig, setConfig } from './config/config';
import {
  questionApprovePlan,
  questionGoal,
  questionOpenAIKey,
  readlineClose,
} from './utils';
import { CommandTask, IConfig, TaskType, WriteFileTask } from './types';
import logger from './libs/logger';
import { ex } from './services/execute.service';
import { initProgram } from './utils/program';
import { LLMGenerateTasks, LLMRephraseGoal } from './services/llm.service';

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
    const { rephrased_goal } = await LLMRephraseGoal(goal, model);
    goal = rephrased_goal;

    logger.info(`Planning tasks for goal: ${chalk.yellow(goal)}`);
    const { tasks } = await LLMGenerateTasks(goal, model);
    const plan = `${tasks
      .map((task, i) => {
        const command = task as CommandTask;
        const writeFile = task as WriteFileTask;

        if (task.type === TaskType.COMMAND) {
          return `${i + 1}. ${chalk.green(command.command)} | ${
            writeFile.description
          } | ${
            command.dangerous ? chalk.red('dangerous') : chalk.green('safe')
          }`;
        }

        if (task.type === TaskType.WRITE_FILE) {
          return `${i + 1}. ${writeFile.description} | ${
            writeFile.dangerous ? chalk.red('dangerous') : chalk.green('safe')
          }`;
        }

        return '';
      })
      .join('\n')}`;

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
