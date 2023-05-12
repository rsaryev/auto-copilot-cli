import { Command } from '../types';
import { LLMAnalyse } from '../llm';
import { spawn } from 'child_process';

export class AnalyzeCommand extends Command {
  async execute(command: string): Promise<void> {
    try {
      const childProcess = spawn(command, [], { shell: true });

      childProcess.stdout.on('data', (stdout) => {
        process.stdout.write(stdout);
      });

      childProcess.stderr.on('data', async (stderr) => {
        const errorOutput = stderr.toString();
        process.stderr.write(stderr);

        await LLMAnalyse.analyse({
          errorOutput,
          command,
          config: this.config,
          handleLLMNewToken: (token) => {
            process.stderr.write(token);
          },
          handleLLMStart: () => {
            process.stderr.write('\n\n**AI Suggestion**\n\n');
          },
          handleLLMEnd: () => {
            process.stderr.write('\n\n**End AI Suggestion**\n\n');
          },
        });
      });
    } catch (e) {
      console.log(e);
    }
  }
}
