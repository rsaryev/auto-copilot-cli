import chalk from 'chalk';
import axios from 'axios';
import { getConfig, setConfig } from './config/config';
import {
  openShellScript,
  questionApprovePlan,
  questionGoal,
  questionOpenAIKey,
} from './utils';
import { IConfig } from './types';
import logger from './libs/logger';
import { initProgram } from './utils/program';
import { LLMGenerateTasks, LLMRephraseGoal } from './services/llm.service';
import { executeCommand } from './utils/command';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import * as os from 'os';

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
    const { rephrased_goal } = await LLMRephraseGoal(goal, model);
    goal = rephrased_goal;

    logger.info(`Planning tasks for goal: ${chalk.yellow(goal)}`);
    const { shell_script, dangerous } = await LLMGenerateTasks(goal, model);

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto_copilot_cli'));
    const pathToSaveShellScript = path.join(tempDir, `./${randomUUID()}.sh`);

    fs.writeFileSync(pathToSaveShellScript, shell_script);

    const questionOpenScript = await openShellScript(
      pathToSaveShellScript,
      dangerous,
    );
    if (questionOpenScript) {
      await executeCommand(`open ${pathToSaveShellScript}`);
    }

    const isApproved = await questionApprovePlan();
    if (!isApproved) {
      logger.info('Aborted');
      return;
    }

    logger.info(`Executing tasks for goal: ${chalk.yellow(goal)}`);

    const shell_script_modified = fs
      .readFileSync(pathToSaveShellScript, 'utf-8')
      .toString();

    const isModifiedShellScript = shell_script !== shell_script_modified;
    if (isModifiedShellScript) {
      logger.warn('Shell script was modified');
    }

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

      logger.error(err?.response?.data.error.message);
      return;
    }

    logger.error('Something went wrong!');
  }
}

export async function main() {
  const program = await initProgram();
  const config = await getConfig();
  const options = program.opts();
  const model = options.model;
  const goal = program.args.join(' ').trim() || (await questionGoal());

  logger.info(`options: ${JSON.stringify(options)}`);
  await start({
    config,
    model,
    goal,
  });
}
