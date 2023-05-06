import chalk from 'chalk';
import inquirer from 'inquirer';

export const questionApprovePlan = async function (): Promise<boolean> {
  return inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'approvePlan',
        message: `Approve plan (y/n) ? `,
      },
    ])
    .then((answers) => answers.approvePlan);
};

export const openShellScript = async function (
  path: string,
  dangerous: boolean,
): Promise<boolean> {
  return inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'executeScript',
        message: `
${chalk.bold('Before executing tasks, please review or modify the script')}
${dangerous ? chalk.red('WARNING: Script is dangerous!') : ''}
${chalk.yellow('Path:')} ${chalk.blue.underline(path)}

Are you sure you want to open to edit the script?`,
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
        message: 'Input your goal: ',
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
          'Enter your OpenAI API key. You can get your API key from https://beta.openai.com/account/api-keys: ',
      },
    ])
    .then((answers) => answers.openAIKey);
};
