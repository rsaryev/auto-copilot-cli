import { Command } from '../types';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { randomUUID } from 'crypto';
import { tempDir } from '../index';
import { executeCommand, exFunction } from '../utils/helpers';
import { askExecute, askOpenEditor } from '../utils';
import { LLMGenerateShell } from '../llm';

export class ShellCommand extends Command {
  async execute(goal: string): Promise<void> {
    const pathToSaveShellScript = path.join(tempDir, `./${randomUUID()}.sh`);
    const shellScript = await exFunction(
      LLMGenerateShell.generateShell.bind(null, this.config, goal),
      'Pending',
      'Done',
    );
    fs.writeFileSync(pathToSaveShellScript, shellScript.shellScript);
    console.log(
      `${shellScript.isDangerous ? chalk.red('✘') : chalk.green('✔')} Safe | ${
        shellScript.description
      }`,
    );

    const questionOpenScript = await askOpenEditor();

    if (questionOpenScript) {
      const command = `${
        this.config.EDITOR || 'code'
      } ${pathToSaveShellScript}`;
      await executeCommand(command);
    }
    const isApproved = await askExecute();
    if (isApproved) {
      const shellScriptModified = fs.readFileSync(
        pathToSaveShellScript,
        'utf-8',
      );
      await executeCommand(shellScriptModified.toString());
    }
  }
}
