import inquirer from 'inquirer';

export const questionExecute = async function (): Promise<boolean> {
  return inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'execute',
        message: `execute ?`,
      },
    ])
    .then((answers) => answers.execute);
};

export const openShellScript = async function (): Promise<boolean> {
  return inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'executeScript',
        message: `are you sure you want to open to edit script`,
      },
    ])
    .then((answers) => answers.executeScript);
};

export const questionGoal = async function (): Promise<string> {
  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'goal',
        message: 'input your goal:',
      },
    ])
    .then((answers) => answers.goal);
};

export const questionOpenAIKey = async function (): Promise<string> {
  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'openAIKey',
        message:
          'enter your OpenAI API key. You can get your API key from https://beta.openai.com/account/api-keys:',
      },
    ])
    .then((answers) => answers.openAIKey);
};
