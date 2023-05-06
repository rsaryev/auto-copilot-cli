import { PromptTemplate } from 'langchain/prompts';
import { z } from 'zod';
import * as os from 'os';

import { StructuredOutputParser } from 'langchain/output_parsers';
import { langchain } from '../libs/langchain';
import { ITask, TaskType } from '../types';

const BaseTaskSchema = z
  .object({
    description: z.string().describe('description of task'),
    dangerous: z
      .boolean()
      .describe(
        'if the task is dangerous, the AI system will ask for approval before executing it.',
      ),
  })
  .nonstrict();
export const CommandTaskSchema = BaseTaskSchema.merge(
  z.object({
    type: z.enum([TaskType.COMMAND]),
    command: z.string().describe(`execute command in terminal`),
  }),
);
export const WriteFileTaskSchema = BaseTaskSchema.merge(
  z.object({
    type: z.enum([TaskType.WRITE_FILE]),
    path: z.string().describe('path for creating file'),
    content: z.string().describe('content for creating file'),
  }),
);

export const LLMGenerateTasks = async (
  goal: string,
  model: string,
): Promise<{
  tasks: ITask[];
}> => {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      tasks: z.array(
        z
          .union([CommandTaskSchema, WriteFileTaskSchema])
          .describe(`list of tasks to achieve the goal`),
      ),
    }),
  );

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: `You a goal, and you will respond with a list of tasks to achieve the goal.
     Reaching the goal should as best as possible with the tasks you provide for the automated system working with terminal commands and file system.
        \n{format_instructions}
        Here is the goal: 
        \`\`\`{goal}\`\`\`
        Operation system: 
        \`\`\`${os.type()}\n\`\`\`\n`,
    inputVariables: ['goal'],
    partialVariables: { format_instructions: formatInstructions },
  });

  const llm = await langchain.createOpenAI(model);
  const input = await prompt.format({ goal });
  const response = await llm.call(input);

  const parsed = await parser.parse(response);
  return parsed || [];
};

export async function LLMRephraseGoal(
  goal: string,
  model: string,
): Promise<{
  rephrased_goal: string;
}> {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      rephrased_goal: z.string().describe(`rephrased goal`),
    }),
  );
  const formatInstructions = parser.getFormatInstructions();

  const llm = await langchain.createOpenAI(model);
  const prompt = new PromptTemplate({
    template: `You a goal, and you will respond with as best as possible rephrased goal for the automated system working with terminal commands and file system.
        \n{format_instructions}
        Here is the goal: 
        \`\`\`{goal}\`\`\`
        Operation system: 
        \`\`\`${os.type()}\n\`\`\`\n`,

    inputVariables: ['goal'],
    partialVariables: { format_instructions: formatInstructions },
  });

  const input = await prompt.format({ goal });
  const response = await llm.call(input);
  return await parser.parse(response);
}
