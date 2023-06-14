import {Command} from '../types';
import fs from 'fs';
import chalk from 'chalk';
import {askOpenEditor, askRetryRefactor, inputRefactor} from '../utils';
import {exec} from 'child_process';
import ora from 'ora';
import {LLMCode} from '../llm';

export class SqlTranslatorCommand extends Command {
    public async execute(
        query: string,
        {
            output,
            schemaPath,
        }: {
            output?: string;
            schemaPath?: string;
        },
    ): Promise<void> {
        if (schemaPath && !fs.existsSync(schemaPath)) {
            console.error(`${chalk.red('✘')} no such file or directory: ${schemaPath}`);
            return;
        }

        output = output || 'output.sql';
        const questionOpenCode = await askOpenEditor();
        if (questionOpenCode) {
            exec(`${this.config.EDITOR || 'code'} ${output}`);
        }

        const spinner = ora('Translating');
        const schema = schemaPath ? fs.readFileSync(schemaPath, 'utf-8') : '';
        const handleLLMStart = () => spinner.start();
        const handleLLMEnd = () => spinner.succeed('Successfully translated');
        const handleLLMError = () => spinner.fail();
        await LLMCode.translateSql({
            config: this.config,
            content: schema,
            prompt: query,
            output,
            handleLLMStart,
            handleLLMEnd,
            handleLLMError,
        });

        const answer = await askRetryRefactor();
        if (answer) {
            const input = await inputRefactor();
            await this.execute(input, {
                schemaPath,
                output,
            });
        }
    }
}
