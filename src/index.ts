import chalk from 'chalk';
import Table from 'cli-table';
import { colorCommand, parseJson, rl, runCommand } from './utlis';
import { getConfig, setConfig } from './config';
import { createChatCompletion } from './openai';
import { ChatCompletionRequestMessage } from 'openai/api';
import {
  chatCompletionMessagesForCreateCli,
  chatCompletionMessagesForRephraseGoal,
} from './messages';
import { IConfig } from './types';
import axios from 'axios';

async function createCommandsForGoal(goal: string): Promise<string[]> {
  console.log(chalk.yellow(`Creating commands for goal: ${goal}`));

  const messages: Array<ChatCompletionRequestMessage> =
    chatCompletionMessagesForCreateCli(goal);
  const completion = await createChatCompletion(messages);
  const commands = parseJson(completion.data.choices[0].message.content);

  if (!Array.isArray(commands)) {
    console.warn(
      chalk.yellow(
        `Goal: ${goal} failed to create commands because chat completion returned is not an array. Retrying...`,
      ),
    );
    return createCommandsForGoal(goal);
  }

  return commands;
}

async function rephraseGoal(goal: string): Promise<string> {
  console.log(chalk.yellow(`Rephrasing goal: ${goal}`));

  const messages: Array<ChatCompletionRequestMessage> =
    chatCompletionMessagesForRephraseGoal(goal);
  const completion = await createChatCompletion(messages);

  return completion.data.choices[0].message.content;
}

const commandQueue: string[] = [];

async function executeCommand(continueCLI: boolean): Promise<void> {
  const command = commandQueue[0];
  if (!command) {
    console.error(chalk.red('command not defined'));
    return;
  }

  const commandSmall = command.trim().replace(/\n/g, '').substring(0, 30);
  if (!continueCLI) {
    const confirmation = await rl.question(
      chalk.yellow(
        `Do you want to execute the following command: ${colorCommand(
          commandSmall,
        )} (y/n)? `,
      ),
    );

    if (confirmation.toLowerCase() !== 'y') {
      console.log(chalk.yellow('Skipping subtask...'));
      commandQueue.shift();
      return;
    }
  }

  const { result, error } = await runCommand(command);
  if (error) {
    console.error(
      chalk.red(
        `Command: ${colorCommand(commandSmall)} failed with error: ${error}`,
      ),
    );
    throw error;
  }

  console.log(
    `Command: ${colorCommand(commandSmall)} executed with result: ${result}`,
  );
  commandQueue.shift();
}

async function executeCommands(continueCLI: boolean): Promise<void> {
  while (commandQueue.length > 0) {
    await executeCommand(continueCLI);
  }
}

async function startAI(config: IConfig, goal: string): Promise<void> {
  try {
    goal = await rephraseGoal(goal);
    console.log(chalk.green(`\nRephrased goal: ${goal}\n`));

    if (commandQueue.length === 0) {
      const commands = await createCommandsForGoal(goal);
      commandQueue.push(...commands);

      const table = new Table({
        head: ['#', 'Command'],
        rows: commands.map((task, index) => [index.toString(), task]),
        colWidths: [5, 100],
      });

      console.log(table.toString() + '\n');
    }

    const regenerateResponse =
      (await rl.question(
        chalk.yellow('Do you want to regenerate commands (y/n)? '),
      )) === 'y';

    if (regenerateResponse) {
      commandQueue.length = 0;
      await startAI(config, goal);
      return;
    }
    const continueCLI =
      (await rl.question(
        chalk.yellow('Do you want to automate the following commands (y/n)? '),
      )) === 'y';

    await executeCommands(continueCLI);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      console.log(
        chalk.yellow(
          `OpenAI API key not found. Please create an OpenAI account and get your API key from https://platform.openai.com/account/api-keys`,
        ),
      );
      config.OPENAI_API_KEY = await rl.question('Input your OpenAI API key: ');
      setConfig(config);
      await startAI(config, goal);
      return;
    }
    console.error(chalk.red(err));
    console.warn(chalk.yellow('Retrying...'));
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await startAI(config, goal);
  }
}

async function main() {
  const config = await getConfig();
  const goal = await rl.question(chalk.yellow('Input your goal: '));
  await startAI(config, goal);

  rl.close();
}

main()
  .then(() => {
    console.log(chalk.green('Done!'));
  })
  .catch((err) => {
    console.error(chalk.red(err));
  });
