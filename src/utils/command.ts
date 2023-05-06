import { exec } from 'child_process';

export function executeCommand(command: string, timeout = 10000) {
  return new Promise((resolve) => {
    const child = exec(command, { timeout });
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);

    child.on('exit', (code, signal) => {
      resolve({ code, signal });
    });
  });
}
