import { IConfig } from '../types';
import { exec } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';
import { askOpenEditor, askExecute } from '../utils';
import { LLMCode, LLMGenerateShell } from './llm.service';
import path from 'path';
import { randomUUID } from 'crypto';
import { executeCommand, exFunction } from '../utils/helpers';
import { tempDir } from '../index';
import ora from 'ora';

export class CommandService {
  private readonly config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  public async refactor(filePath: string) {
    if (!fs.existsSync(filePath)) {
      console.log(`${chalk.red('✘')} no such file or directory: ${filePath}`);
      return;
    }
    const fileType = filePath.split('.').pop()!;
    const outputPath = filePath.replace(
      `.${fileType}`,
      `.refactored.${fileType}`,
    );
    const questionOpenCode = await askOpenEditor();
    if (questionOpenCode) {
      exec(`${this.config.EDITOR || 'code'} ${outputPath}`);
    }

    const spinner = ora('Refactoring');
    const content = fs.readFileSync(filePath, 'utf-8');
    await LLMCode.refactor({
      config: this.config,
      content,
      output: outputPath,
      handleLLMStart: () => spinner.start(),
      handleLLMEnd: () => spinner.succeed('Refactored'),
      handleLLMError: () => spinner.fail(),
    });
  }

  public async shell(goal: string) {
    const pathToSaveShellScript = path.join(tempDir, `./${randomUUID()}.sh`);
    const { shell_script, dangerous, description } = await exFunction(
      LLMGenerateShell.generateShell.bind(null, this.config, goal),
      'Pending',
      'Done',
    );

    fs.writeFileSync(pathToSaveShellScript, shell_script);
    console.log(
      `${dangerous ? chalk.red('✘') : chalk.green('✔')} Safe | ${description}`,
    );

    const questionOpenScript = await askOpenEditor();
    if (questionOpenScript) {
      const command = `${
        this.config.EDITOR || 'code'
      } ${pathToSaveShellScript}`;
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
  }
}
