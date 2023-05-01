import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';

const rl = createInterface({ input, output });

export const questionAutoExecuteCommands = async function (): Promise<boolean> {
  const req = await rl.question('Execute commands automatically (y/n)? ');
  return req === 'y';
};

export const questionFixCommand = async function (
  command: string,
): Promise<boolean> {
  const req = await rl.question(
    `Regenerate command ${chalk.green(command)} (y/n)? `,
  );
  return req === 'y';
};

export const questionExecuteCommand = async function (
  command: string,
): Promise<boolean> {
  const req = await rl.question(
    `Execute command ${chalk.green(command)} (y/n)? `,
  );
  return req === 'y';
};

export const questionRegenerateCommands = async function (): Promise<boolean> {
  const req = await rl.question('Regenerate commands (y/n)? ');
  return req === 'y';
};

export const questionGoal = async function (): Promise<string> {
  return await rl.question('Input your goal: ');
};

export const questionOpenAIKey = async function (): Promise<string> {
  return await rl.question(
    'Enter your OpenAI API key. You can get your API key from https://beta.openai.com/account/api-keys: ',
  );
};

export const readlineClose = async function (): Promise<void> {
  await rl.close();
};
