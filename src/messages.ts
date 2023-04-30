import { ChatCompletionRequestMessage } from 'openai/api';
import {
  ANSWER_ONLY_JSON_PARSEABLE_ARRAY_OF_STRINGS,
  ANSWER_ONLY_STRING,
  CREATE_CLI,
  REPHRASE_GOAL,
} from './constants';

export const chatCompletionMessagesForCreateCli = (
  goal: string,
): Array<ChatCompletionRequestMessage> => [
  {
    role: 'system',
    content: CREATE_CLI.replace('{goal}', goal),
  },
  {
    role: 'system',
    content: ANSWER_ONLY_JSON_PARSEABLE_ARRAY_OF_STRINGS,
  },
];

export const chatCompletionMessagesForRephraseGoal = (
  goal: string,
): Array<ChatCompletionRequestMessage> => [
  {
    role: 'system',
    content: REPHRASE_GOAL.replace('{goal}', goal),
  },
  {
    role: 'system',
    content: ANSWER_ONLY_STRING,
  },
];
