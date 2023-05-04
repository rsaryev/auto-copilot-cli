import { exec, ExecException } from 'child_process';

export function executeCommand(
  command: string,
  timeout = 10000,
): Promise<{
  result: string;
  error: string | null;
}> {
  return new Promise((resolve) => {
    exec(
      command,
      { timeout },
      (error: ExecException | null, stdout: string, stderr: string) => {
        if (error) {
          resolve({ result: stdout, error: stderr });
        } else {
          resolve({ result: stdout, error: null });
        }
      },
    );
  });
}
