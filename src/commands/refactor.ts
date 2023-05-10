import { Command } from '../types';
import fs from 'fs';
import chalk from 'chalk';
import { askOpenEditor, askRetryRefactor, inputRefactor } from '../utils';
import { exec } from 'child_process';
import ora from 'ora';
import { LLMCode } from '../llm';

export class Refactor extends Command {
  public async executeCommand(
    filePath: string,
    prompt?: string,
    outputFilePath?: string,
  ): Promise<void> {
    if (!fs.existsSync(filePath)) {
      console.log(`${chalk.red('✘')} no such file or directory: ${filePath}`);
      return;
    }
    const fileType = filePath.split('.').pop()!;
    const outputPath =
      outputFilePath ||
      filePath.replace(`.${fileType}`, `.refactored.${fileType}`);
    const questionOpenCode = await askOpenEditor();
    if (questionOpenCode) {
      exec(`${this.config.EDITOR || 'code'} ${outputPath}`);
    }

    const spinner = ora('Refactoring');
    const content = fs.readFileSync(filePath, 'utf-8');
    await LLMCode.refactor({
      config: this.config,
      content,
      prompt,
      output: outputPath,
      handleLLMStart: () => spinner.start(),
      handleLLMEnd: () => spinner.succeed('Refactored'),
      handleLLMError: () => spinner.fail(),
    });

    const answer = await askRetryRefactor();
    if (answer) {
      const input = await inputRefactor();
      await this.executeCommand(outputPath, input, outputPath);
    }
  }
}
