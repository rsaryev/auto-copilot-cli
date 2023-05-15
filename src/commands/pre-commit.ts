import { Command } from '../types';
import { LLMPreCommit } from '../llm';
import { exec } from 'child_process';
import { promisify } from 'util';
import { askCommit, askRetryCommit } from '../utils';
import ora from 'ora';

export class PreCommitCommand extends Command {
  async execute(
    message: string,
    options: {
      yes?: string;
    },
  ): Promise<void> {
    const spinner = ora('Analyzing').start();
    try {
      const { config } = this;
      const { stdout: diff } = await promisify(exec)('git diff --cached');
      if (!diff) {
        spinner.succeed('No diff found using git add');
        return;
      }
      const commitMessage = await LLMPreCommit.preCommit({ config, diff });
      spinner.stop();
      const preparedCommitMessage =
        commitMessage.startsWith('"') && commitMessage.endsWith('"') ? commitMessage : `"${commitMessage}"`;
      const shouldCommit = options.yes ? true : await askCommit(preparedCommitMessage);
      if (shouldCommit) {
        const spinner = ora('Committing').start();
        await promisify(exec)(`git commit -m ${preparedCommitMessage}`);
        spinner.succeed('Successfully committed');
      } else {
        const shouldRetry = await askRetryCommit();
        if (shouldRetry) {
          await this.execute(message, options);
        }
      }
    } catch (error) {
      spinner.fail('Failed to commit');
      throw error;
    }
  }
}
