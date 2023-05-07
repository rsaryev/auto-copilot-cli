import chalk from 'chalk';
import axios from 'axios';
import { getConfig, setConfig } from './config/config';
import {
  openShellScript,
  questionExecute,
  questionGoal,
  questionOpenAIKey,
} from './utils';
import { IConfig } from './types';
import { initProgram } from './utils/program';
import { LLMGenerateTasks, LLMRephraseGoal } from './services/llm.service';
import { executeCommand } from './utils/command';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import * as os from 'os';
import { exFunction } from './utils/helpers';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto_copilot_cli'));
async function start({
  config,
  model,
  goal,
}: {
  config: IConfig;
  goal: string;
  model: string;
}): Promise<void> {
  try {
    const pathToSaveShellScript = path.join(tempDir, `./${randomUUID()}.sh`);
    goal = await exFunction(
      LLMRephraseGoal.bind(null, goal, model),
      `rephrasing`,
    );

    const { shell_script, dangerous } = await exFunction(
      LLMGenerateTasks.bind(null, goal, model),
      `generating`,
    );

    fs.writeFileSync(pathToSaveShellScript, shell_script);
    console.log(`${dangerous ? chalk.red('✘') : chalk.green('✔')} safe`);
    const questionOpenScript = await openShellScript();
    if (questionOpenScript) {
      await exFunction(
        executeCommand.bind(null, `open ${pathToSaveShellScript}`),
        `open`,
      );
    }

    const isApproved = await questionExecute();
    if (!isApproved) {
      return;
    }

    const shell_script_modified = fs
      .readFileSync(pathToSaveShellScript, 'utf-8')
      .toString();

    await executeCommand(shell_script_modified);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        config.OPENAI_API_KEY = await questionOpenAIKey();
        setConfig(config);
        await start({
          config,
          goal,
          model,
        });
        return;
      }

      console.log(`${chalk.red('✘')} ${err.message}`);
      return;
    }

    console.log(`${chalk.red('✘')} something went wrong!`);
  }
}

export async function main() {
  const program = await initProgram();
  const config = await getConfig();
  const options = program.opts();
  const model = options.model;
  const goal = program.args.join(' ').trim() || (await questionGoal());

  await start({
    config,
    model,
    goal,
  });
}
