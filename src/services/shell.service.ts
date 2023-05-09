import chalk from 'chalk';
import axios from 'axios';
import { setConfig } from '../config/config';
import { askOpenEditor, askExecute, askOpenAIKey } from '../utils';
import { IConfig } from '../types';
import { LLMGenerateShell } from './llm.service';
import { executeCommand } from '../utils/command';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { exFunction } from '../utils/helpers';
import { tempDir } from '../index';

export async function shellService({
  config,
  goal,
}: {
  config: IConfig;
  goal: string;
}): Promise<void> {
  try {
    const pathToSaveShellScript = path.join(tempDir, `./${randomUUID()}.sh`);
    const { shell_script, dangerous, description } = await exFunction(
      LLMGenerateShell.bind(null, goal, config.MODEL),
      `Pending`,
    );

    fs.writeFileSync(pathToSaveShellScript, shell_script);
    console.log(
      `${dangerous ? chalk.red('✘') : chalk.green('✔')} Safe | ${description}`,
    );

    const questionOpenScript = await askOpenEditor();
    if (questionOpenScript) {
      const command = `${config.EDITOR || 'code'} ${pathToSaveShellScript}`;
      await executeCommand(command);
    }

    const isApproved = await askExecute();
    if (!isApproved) {
      return;
    }

    const shell_script_modified = fs
      .readFileSync(pathToSaveShellScript, 'utf-8')
      .toString();

    await executeCommand(shell_script_modified);
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        config.OPENAI_API_KEY = await askOpenAIKey();
        setConfig(config);
        await shellService({
          config,
          goal,
        });
        return;
      }
    }

    console.log(
      `${chalk.red('✘')} ${err.response?.data?.error?.message || err.message}`,
    );
  }
}
