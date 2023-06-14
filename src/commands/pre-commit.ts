import {Command} from '../types';
import {LLMPreCommit} from '../llm';
import {exec} from 'child_process';
import {promisify} from 'util';
import {askCommit, askRetryCommit} from '../utils';
import ora from 'ora';
import {gitDiffCommand} from '../utils/git';

export class PreCommitCommand extends Command {
    async execute(
        message: string,
        options: {
            yes?: string;
        },
    ): Promise<void> {
        const spinner = ora('Analyzing').start();
        try {
            const {config} = this;

            const diff = await gitDiffCommand();
            if (!diff) {
                spinner.succeed('No diff found using git add');
                return;
            }

            const {title, messages} = await LLMPreCommit.preCommit({config, diff});
            spinner.stop();

            const commitBullets = messages?.map((message) => `- ${message}`).join('\n') ?? '';
            const fullCommitMessage = `"${title}${commitBullets ? `\n\n${commitBullets}` : ''}"`;
            const shouldCommit = options.yes ? true : await askCommit(fullCommitMessage);

            if (shouldCommit) {
                spinner.text = 'Committing';
                await promisify(exec)(`git commit -m ${fullCommitMessage}`);
                spinner.succeed('Successfully committed');
            } else {
                const shouldRetry = await askRetryCommit();
                if (shouldRetry) await this.execute(message, options);
            }
        } catch (error) {
            spinner.fail('Failed to commit');
            throw error;
        }
    }
}
