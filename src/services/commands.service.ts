import chalk from 'chalk';
import type { ChatCompletionRequestMessage } from 'openai/api';
import {
  CREATE_CLI_PROMPT,
  FIX_CLI_PROMPT,
  REPHRASE_GOAL_PROMPT,
} from '../prompt';
import { createChatCompletion } from '../libs/openai';
import logger from '../libs/logger';
import { parseJson } from '../utils';

const MAX_RETRIES = 3;
const NOT_AN_ARRAY_WARNING_MESSAGE = (target: string, retry: number) =>
  `Generating commands for target '${chalk.yellow(
    target,
  )}' failed. Retrying... (${retry}/${MAX_RETRIES})`;

export async function rephraseGoal(goal: string): Promise<string> {
  const messages: Array<ChatCompletionRequestMessage> = [
    {
      role: 'system',
      content: REPHRASE_GOAL_PROMPT.replace('{goal}', `"${goal}"`),
    },
  ];
  const completion = await createChatCompletion(messages);
  return completion.data.choices[0].message.content;
}

export async function generateCommands(target: string): Promise<string[]> {
  const logTarget = chalk.yellow(target);
  logger.info(`Generating commands for target: ${logTarget}`);

  const messages: ChatCompletionRequestMessage[] = [
    {
      role: 'system',
      content: CREATE_CLI_PROMPT.replace('{goal}', target),
    },
  ];

  let commands: string[] = [];
  for (let retry = 1; retry <= MAX_RETRIES; retry++) {
    const completion = await createChatCompletion(messages);
    const content = parseJson(completion.data.choices[0].message.content);

    if (Array.isArray(content)) {
      commands = content;
      break;
    } else {
      logger.warn(NOT_AN_ARRAY_WARNING_MESSAGE(target, retry));
      const rephrasedTarget = await rephraseGoal(target);
      logger.info(`Rephrased goal: ${chalk.yellow(rephrasedTarget)}`);
    }
  }

  return commands;
}

export async function fixErrorCommands(
  target: string,
  error: string,
): Promise<string> {
  logger.info(`Fixing error commands for target: ${chalk.yellow(target)}`);

  const messages: ChatCompletionRequestMessage[] = [
    {
      role: 'system',
      content: FIX_CLI_PROMPT.replace('{command}', target).replace(
        '{error}',
        `"${error.trim().replace(/\n/g, '').substring(0, 100)}"`,
      ),
    },
  ];

  const completion = await createChatCompletion(messages);
  const { content } = completion.data.choices[0].message;
  logger.info(`Fixed error commands: ${chalk.green(content)}`);
  return content;
}
