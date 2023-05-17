import { Command } from '../types';
import { LLMLintFile } from '../llm';
import { gitDiffFiles } from '../utils/git';
import chalk from 'chalk';

export class LintFileCommand extends Command {
  async execute(): Promise<void> {
    const files = await gitDiffFiles();
    if (files.length === 0) {
      console.log(`${chalk.red('✘')} No files to review, use git add to add files to review`);
      return;
    }
    const handleLLMStart = async () => {
      void 0;
    };
    const handleLLMEnd = async () => {
      void 0;
    };
    const handleLLMError = async () => {
      void 0;
    };
    const handleLLMNewToken = async (token: string) => {
      process.stderr.write(token);
    };

    await LLMLintFile.analyse({
      files,
      config: this.config,
      handleLLMNewToken,
      handleLLMError,
      handleLLMStart,
      handleLLMEnd,
    });
  }
}
