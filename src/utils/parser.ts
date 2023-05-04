import Ajv from 'ajv';
import { ITask } from '../types';
import { CreateChatCompletionResponse } from 'openai';

const ajv = new Ajv();

export const JSON_SCHEMA_TASK: object = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['COMMAND', 'WRITE_FILE'],
    },
    command: {
      type: 'string',
    },
    path: {
      type: 'string',
    },
    content: {
      type: 'string',
    },
    dangerous: {
      type: 'boolean',
    },
    description: {
      type: 'string',
    },
  },
  required: ['type', 'description'],
};

export const JSON_SCHEMA_TASKS: object = {
  type: 'array',
  items: JSON_SCHEMA_TASK,
};

const parseJson = (json: string): object | Array<unknown> | null => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

export const parseTasks = (
  completion: CreateChatCompletionResponse,
): ITask[] | [] => {
  const content = completion.choices[0]?.message?.content || '';
  const parseResult = parseJson(content.replace(/```/g, ''));

  const valid = ajv.validate(JSON_SCHEMA_TASKS, parseResult);
  if (!valid) {
    return [];
  }

  return parseResult as ITask[];
};
