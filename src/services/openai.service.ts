import { createChatCompletion } from '../libs/openai';
import { ChatCompletionRequestMessage } from 'openai/api';
import * as os from 'os';
import { parseTasks } from '../utils';
import { ITask } from '../types';

export async function AIGenerateTasks(goal: string): Promise<ITask[]> {
  const content = JSON.stringify(
    `
        I will send you a goal, and you will respond with a list of tasks to achieve the goal. These tasks will be used in an artificial intelligence system that also works with the command line ${os.type()}.
        Return the response as valid JSON in one unique code block. that can be used in JSON.parse().
        
        Tasks types:
          COMMAND - execute command in terminal
          WRITE_FILE - write file in terminal
        
        Example: [
            {
                "type": "COMMAND",
                "command": "git add .",
                // if the command is very dangerous, then you need to specify dangerous: true
                "dangerous": "{{true/false}}",
                "description": "{{"description"}}",
            }, 
            {
                "type": "WRITE_FILE",
                "path": "README.md",
                "dangerous": "{{true/false}}",
                "content": "Hello world",
                "description": "{{"description"}}",
            }]
        `
      .trim()
      .replace(/\n/g, ''),
  );

  const messages: ChatCompletionRequestMessage[] = [
    {
      role: 'system',
      content,
    },
    {
      role: 'user',
      content: goal,
    },
  ];

  const completion = await createChatCompletion(messages);
  return parseTasks(completion);
}

export async function rephraseGoal(goal: string): Promise<string> {
  const messages: Array<ChatCompletionRequestMessage> = [
    {
      role: 'system',
      content: `
        I want you to rephrase the following goal for the AI system which works with the command line.
        Answer as a string. For example: add changes to git branch
        `,
    },
    {
      role: 'user',
      content: goal,
    },
  ];
  const completion = await createChatCompletion(messages);
  return completion.choices[0]?.message?.content || '';
}
