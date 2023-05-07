import ora from 'ora';
export const exFunction = async <T>(
  fn: () => Promise<T>,
  message: string,
): Promise<T> => {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  }
};
