import inquirer from 'inquirer';

export const askExecute = async (): Promise<boolean> => {
  const { execute } = await inquirer.prompt<{ execute: 'Yes' | 'No' }>([
    {
      type: 'list',
      name: 'execute',
      message: `🚀 Execute?`,
      choices: ['Yes', 'No'],
    },
  ]);
  return execute === 'Yes';
};

export const askOpenEditor = async (): Promise<boolean> => {
  const { openEditor } = await inquirer.prompt<{ openEditor: 'Yes' | 'No' }>([
    {
      type: 'list',
      name: 'openEditor',
      message: `💻 Open in editor?`,
      choices: ['Yes', 'No'],
    },
  ]);
  return openEditor === 'Yes';
};

export const askGoal = async (): Promise<string> => {
  const { goal } = await inquirer.prompt<{ goal: string }>([
    {
      type: 'input',
      name: 'goal',
      message: '🎯 Input your goal:',
    },
  ]);
  return goal;
};

export const askOpenAIKey = async (): Promise<string> => {
  const { openAIKey } = await inquirer.prompt<{ openAIKey: string }>([
    {
      type: 'input',
      name: 'openAIKey',
      message: '🔑 Enter your OpenAI API key. You can get your API key from https://beta.openai.com/account/api-keys:',
    },
  ]);
  return openAIKey;
};

export const askRetryRefactor = async (): Promise<boolean> => {
  const { refactor } = await inquirer.prompt<{ refactor: 'Yes' | 'No' }>([
    {
      type: 'list',
      name: 'refactor',
      message: `🔁 Retry refactor?`,
      choices: ['Yes', 'No'],
    },
  ]);
  return refactor === 'Yes';
};

export const inputRefactor = async (): Promise<string> => {
  const { refactor } = await inquirer.prompt<{ refactor: string }>([
    {
      type: 'input',
      name: 'refactor',
      message: '🎯 Input your refactor plan:',
    },
  ]);
  return refactor;
};

export const askTest = async (): Promise<boolean> => {
  const { test } = await inquirer.prompt<{ test: 'Yes' | 'No' }>([
    {
      type: 'list',
      name: 'test',
      message: `🔁 Retry generate tests?`,
      choices: ['Yes', 'No'],
    },
  ]);
  return test === 'Yes';
};

export const inputTest = async (): Promise<string> => {
  const { input } = await inquirer.prompt<{ input: string }>([
    {
      type: 'input',
      name: 'input',
      message: '🎯 Input your test plan:',
    },
  ]);
  return input;
};

export const inputAsk = async (): Promise<string> => {
  const { ask } = await inquirer.prompt<{ ask: string }>([
    {
      type: 'input',
      name: 'ask',
      message: '👉',
    },
  ]);
  return ask;
};
