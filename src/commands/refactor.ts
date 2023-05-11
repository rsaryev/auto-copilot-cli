import { Command } from '../types';
import fs from 'fs';
import chalk from 'chalk';
import { askOpenEditor, askRetryRefactor, inputRefactor } from '../utils';
import { exec } from 'child_process';
import ora from 'ora';
import { LLMCode } from '../llm';

export class RefactorCommand extends Command {
  public async execute(
    filePath: string,
    prompt?: string,
    outputFilePath?: string,
  ): Promise<void> {
    if (!fs.existsSync(filePath)) {
      console.error(`${chalk.red('✘')} no such file or directory: ${filePath}`);
      return;
    }

    const fileType = filePath.split('.').pop();
    if (!fileType) {
      console.error(`${chalk.red('✘')} invalid file type: ${filePath}`);
      return;
    }

    const outputPath =
      outputFilePath ||
      filePath.replace(`.${fileType}`, `.refactored.${fileType}`);

    const questionOpenCode = await askOpenEditor();
    if (questionOpenCode) {
      exec(`${this.config.EDITOR || 'code'} ${outputPath}`);
    }

    const spinner = ora('Refactoring');
    const content = fs.readFileSync(filePath, 'utf-8');

    const handleLLMStart = () => spinner.start();
    const handleLLMEnd = () => spinner.succeed('Refactored');
    const handleLLMError = () => spinner.fail();

    await LLMCode.refactor({
      config: this.config,
      content,
      prompt,
      output: outputPath,
      handleLLMStart,
      handleLLMEnd,
      handleLLMError,
    });

    const answer = await askRetryRefactor();
    if (answer) {
      const input = await inputRefactor();
      await this.execute(outputPath, input, outputPath);
    }
  }
}
