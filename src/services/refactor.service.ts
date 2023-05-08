import { IConfig } from '../types';
import { LLMRefactorCode } from './llm.service';
import ora from 'ora';
import { exec } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';

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

    const fileType = path.split('.').pop();
    const outputPath = path.replace(`.${fileType}`, `.refactored.${fileType}`);
    const spinner = ora('Refactoring').start();
    const writeStream = await LLMRefactorCode(path, config.MODEL, outputPath);

    return new Promise((resolve, reject) => {
      writeStream.on('open', () => {
        exec(`${config.EDITOR || 'code'} ${outputPath}`);
      });

      writeStream.on('close', () => {
        spinner.succeed();
        return resolve('closed');
      });

      writeStream.on('error', (err) => {
        spinner.fail();
        return reject(err);
      });
    });
  } catch (err) {
    console.log(`Error refactoring file: ${path}`);
    return Promise.reject(err);
  }
}
