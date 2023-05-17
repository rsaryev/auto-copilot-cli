import { Command } from '../types';
import { LLMLintFile } from '../llm';

export class LintCheckFileCommand extends Command {
  async execute(): Promise<void> {
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
      config: this.config,
      handleLLMNewToken,
      handleLLMError,
      handleLLMStart,
      handleLLMEnd,
    });
  }
}
