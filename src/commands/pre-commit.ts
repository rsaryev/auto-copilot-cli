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
    const spinner = ora('Analyzing diff').start();
    try {
      const { config } = this;
      const { stdout } = await promisify(exec)('git diff --cached');
      if (!stdout) {
        spinner.succeed('No diff found');
        return;
      }
      const commitMessage = await LLMPreCommit.preCommit({ config, diff: stdout });
      spinner.stop();
      const shouldCommit = options.yes ? true : await askCommit(commitMessage);
      if (shouldCommit) {
        const spinner = ora('Committing').start();
        await promisify(exec)(`git add . && git commit -m "${commitMessage}"`);
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
