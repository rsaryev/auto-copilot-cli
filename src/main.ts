import chalk from 'chalk';
import axios from 'axios';

import { ChatCompletionRequestMessage } from 'openai/api';
import { getConfig, setConfig } from './config/config';
import {
  questionAutoExecuteCommands,
  questionGoal,
  questionOpenAIKey,
  questionRegenerateCommands,
  readlineClose,
} from './utils';
import { createChatCompletion } from './libs/openai';
import { IConfig } from './types';
import logger from './libs/logger';
import { executeCommandsService } from './services/execute-commands.service';
import { generateCommands } from './services/commands.service';
import { ANSWER_ONLY_STRING, REPHRASE_GOAL } from './constants';

async function rephraseGoal(goal: string): Promise<string> {
  const messages: Array<ChatCompletionRequestMessage> = [
    {
      role: 'system',
      content: REPHRASE_GOAL.replace('{goal}', goal),
    },
    {
      role: 'system',
      content: ANSWER_ONLY_STRING,
    },
  ];
  const completion = await createChatCompletion(messages);
  return completion.data.choices[0].message.content;
}

async function start(
  config: IConfig,
  goal: string,
  isAutoExecute: boolean,
): Promise<void> {
  try {
    goal = await rephraseGoal(goal);
    logger.info(`Rephrased goal: ${chalk.yellow(goal)}`);

    const commands = await generateCommands(goal);
    if (commands.length === 0) {
      logger.info(`No commands found for goal: ${chalk.yellow(goal)}`);
      await readlineClose();
      return;
    }

    logger.info(
      `Planning commands: \n${chalk.yellow(
        commands
          .map(
            (c, i) => `${i + 1}. ${c.trim().replace(/\n/g, '').substring(0, 50)}`,
          )
          .join('\n'),
      )}`,
    );
    const isRegenerateCommands = await questionRegenerateCommands();
    if (isRegenerateCommands) {
      await start(config, goal, isAutoExecute);
      return;
    }

    await executeCommandsService.executeCommands(commands, isAutoExecute);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      config.OPENAI_API_KEY = await questionOpenAIKey();
      setConfig(config);
      await start(config, goal, isAutoExecute);
      return;
    }
    console.log(err);
    logger.error(chalk.red(err));
  }
}

export async function main() {
  const config = await getConfig();
  const goal = process.argv.slice(2).join(' ') || (await questionGoal());
  const isAutoExecute = await questionAutoExecuteCommands();
  await start(config, goal, isAutoExecute);

  return readlineClose();
}
