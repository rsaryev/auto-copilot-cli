import {Command} from '../types';
import {LLMChat} from '../llm';
import * as readline from 'readline';
import {inputAsk} from '../utils';

export class ChatCommand extends Command {
    async execute(
        message: string,
        options: {
            prompt?: string;
        },
    ): Promise<void> {
        const {prompt} = options;

        let input = '';
        while (input !== 'exit') {
            input = await inputAsk();
            await LLMChat.chat({
                config: this.config,
                input,
                prompt,
                handleLLMStart: () => {
                    readline.cursorTo(process.stdout, 0);
                    process.stdout.write('🤖 ');
                },
                handleLLMEnd: () => {
                    process.stdout.write('\n');
                },
                handleLLMError: () => {
                    process.stdout.write('\n');
                },
                handleLLMNewToken: (token: string) => {
                    process.stdout.write(token);
                },
            });
        }
    }
}