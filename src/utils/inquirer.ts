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
      message:
        '🔑 Enter your OpenAI API key. You can get your API key from https://beta.openai.com/account/api-keys:',
    },
  ]);
  return openAIKey;
};
