import { CreateChatCompletionResponse } from 'openai';
import { validateTask } from './validate';
import { ITask } from '../types';

const parseJson = <T extends object | unknown[]>(json: string): T | null => {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    return null;
  }
};

export const parseTasks = (
  completion: CreateChatCompletionResponse,
): ITask[] | [] => {
  const content = completion.choices[0]?.message?.content || '';
  const parseResult = parseJson(content.replace(/```/g, ''));
  if (!parseResult || !Array.isArray(parseResult)) {
    return [];
  }

  const tasks = parseResult as ITask[];
  return tasks.filter((task) => {
    const isValid = validateTask(task);
    if (!isValid) {
      console.error('Invalid task', task);
    }
    return isValid;
  });
};
