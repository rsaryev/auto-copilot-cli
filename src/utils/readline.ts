import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';

const rl = createInterface({ input, output });

export const questionAutoExecuteTasks = async function (): Promise<boolean> {
  const req = await rl.question('Execute tasks automatically (y/n)? ');
  return req === 'y';
};
export const questionExecuteTask = async function (
  task: string,
): Promise<boolean> {
  const req = await rl.question(`Execute command ${chalk.green(task)} (y/n)? `);
  return req === 'y';
};

export const questionApprovePlan = async function (): Promise<boolean> {
  const req = await rl.question('Approve plan (y/n) ? ');
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
