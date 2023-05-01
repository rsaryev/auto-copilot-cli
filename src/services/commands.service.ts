import chalk from 'chalk';
import type { ChatCompletionRequestMessage } from 'openai/api';
import {
  ANSWER_ONLY_JSON_PARSEABLE_ARRAY_OF_STRINGS,
  ANSWER_ONLY_ONE_COMMAND,
  CREATE_CLI,
  FIX_COMMANDS,
} from '../constants';
import { createChatCompletion } from '../libs/openai';
import logger from '../libs/logger';
import { parseJson } from '../utils';

const MAX_RETRIES = 3;
const NOT_AN_ARRAY_WARNING_MESSAGE = (target: string, retry: number) => `Generating commands for target '${chalk.yellow(
  target,
)}' failed. Retrying... (${retry}/${MAX_RETRIES})`;

export async function generateCommands(target: string): Promise<string[]> {
  const logTarget = chalk.yellow(target);
  logger.info(`Generating commands for target: ${logTarget}`);

  const messages: ChatCompletionRequestMessage[] = [
    {
      role: 'system',
      content: CREATE_CLI.replace('{goal}', target),
    },
    {
      role: 'system',
      content: ANSWER_ONLY_JSON_PARSEABLE_ARRAY_OF_STRINGS,
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
      content: FIX_COMMANDS.replace('{command}', target).replace(
        '{error}',
        error.trim().replace(/\n/g, '').substring(0, 100),
      ),
    },
    {
      role: 'system',
      content: ANSWER_ONLY_ONE_COMMAND,
    },
  ];

  const completion = await createChatCompletion(messages);
  const { content } = completion.data.choices[0].message;
  logger.info(`Fixed error commands: ${chalk.green(content)}`);
  return content;
}
