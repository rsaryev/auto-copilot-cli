import Ajv from 'ajv';
import { TaskType } from '../types';

const ajv = new Ajv();

export const JSON_SCHEMA_COMMAND: object = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [TaskType.COMMAND],
    },
    command: {
      type: 'string',
    },
    dangerous: {
      type: 'boolean',
    },
    description: {
      type: 'string',
    },
  },
  required: ['type', 'command', 'dangerous', 'description'],
} as const;

export const JSON_SCHEMA_WRITE_FILE = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [TaskType.WRITE_FILE],
    },
    dangerous: {
      type: 'boolean',
    },
    description: {
      type: 'string',
    },
    path: {
      type: 'string',
    },
    content: {
      type: 'string',
    },
  },
  required: ['type', 'dangerous', 'description', 'path', 'content'],
} as const;

export const mapSchemaToTask = new Map<TaskType, object>([
  [TaskType.COMMAND, JSON_SCHEMA_COMMAND],
  [TaskType.WRITE_FILE, JSON_SCHEMA_WRITE_FILE],
]);

export function validateTask(task: any): boolean {
  const schema = mapSchemaToTask.get(task.type);
  if (!schema) {
    return false;
  }
  return ajv.validate(schema, task);
}
