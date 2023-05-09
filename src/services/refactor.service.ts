import { IConfig } from '../types';
import { LLMRefactorCode } from './llm.service';
import ora from 'ora';
import { exec } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';
import axios, { AxiosError } from 'axios';
import { askOpenEditor, askOpenAIKey } from '../utils';
import { setConfig } from '../config/config';
import { langchain } from '../libs/langchain';

export async function refactorService({
  config,
  path,
}: {
  config: IConfig;
  path: string;
}) {
  try {
    if (!fs.existsSync(path)) {
      console.log(`${chalk.red('✘')} no such file or directory: ${path}`);
      return;
    }

    const fileType = path.split('.').pop()!;
    const outputPath = path.replace(`.${fileType}`, `.refactored.${fileType}`);
    const input = await LLMRefactorCode(path);

    const writeStream = fs.createWriteStream(outputPath);
    const llm = await langchain.createOpenAI(config.MODEL, true, 3256);

    const questionOpenCode = await askOpenEditor();
    if (questionOpenCode) {
      exec(`${config.EDITOR || 'code'} ${outputPath}`);
    }
    const spinner = ora('Refactoring').start();

    await llm.call(input, undefined, [
      {
        handleLLMNewToken(token: string) {
          writeStream.write(token);
        },
        handleLLMEnd() {
          spinner.succeed();
          writeStream.end();
        },

        handleLLMError() {
          spinner.fail();
        },
      },
    ]);
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if ((err as AxiosError).response?.status === 401) {
        config.OPENAI_API_KEY = await askOpenAIKey();
        setConfig(config);
        await refactorService({
          config,
          path,
        });
        return;
      }
    }
    console.log(
      `${chalk.red('✘')} ${err.response?.data?.error?.message || err.message}`,
    );
  }
}
