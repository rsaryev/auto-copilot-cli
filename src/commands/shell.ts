import { Command } from '../types';
import path from 'path';
import { tempDir } from '../index';
import { randomUUID } from 'crypto';
import { executeCommand, exFunction } from '../utils/helpers';
import fs from 'fs';
import chalk from 'chalk';
import { askExecute, askOpenEditor } from '../utils';
import { LLMGenerateShell } from '../llm';

export class Shell extends Command {
  public async executeCommand(goal: string): Promise<void> {
    const pathToSaveShellScript = path.join(tempDir, `./${randomUUID()}.sh`);
    const shellScript = await exFunction(
      LLMGenerateShell.generateShell.bind(null, this.config, goal),
      'Pending',
      'Done',
    );

    fs.writeFileSync(pathToSaveShellScript, shellScript.shell_script);
    console.log(
      `${shellScript.dangerous ? chalk.red('✘') : chalk.green('✔')} Safe | ${
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
      const shell_script_modified = fs
        .readFileSync(pathToSaveShellScript, 'utf-8')
        .toString();
      await executeCommand(shell_script_modified);
    }
  }
}
