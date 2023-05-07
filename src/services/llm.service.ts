import { PromptTemplate } from 'langchain/prompts';
import { z } from 'zod';
import * as os from 'os';

import { StructuredOutputParser } from 'langchain/output_parsers';
import { langchain } from '../libs/langchain';

export const LLMGenerateTasks = async (
  goal: string,
  model: string,
): Promise<{
  shell_script: string;
  dangerous: boolean;
}> => {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      shell_script: z
        .string()
        .describe(`shell script with comments for reach goal`),
      dangerous: z
        .boolean()
        .describe(
          `if the shell is very dangerous, it will be marked as dangerous`,
        ),
    }),
  );

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template:
      'You a goal, and you will respond with shell script that will execute tasks for this goal.\nHere is the goal: {goal}\n{format_instructions}\nOS: {os}\nDate: {date}\nWorkdir: {workdir}\n',
    inputVariables: ['goal', 'os', 'date', 'workdir'],
    partialVariables: { format_instructions: formatInstructions },
  });

  const llm = await langchain.createOpenAI(model);
  const input = await prompt.format({
    goal,
    os: os.type(),
    date: new Date(),
    workdir: process.cwd(),
  });
  const response = await llm.call(input);

  const parsed = await parser.parse(response);
  return parsed || [];
};

export async function LLMRephraseGoal(
  goal: string,
  model: string,
): Promise<string> {
  const parser = StructuredOutputParser.fromZodSchema(
    z.string().describe(`rephrased goal`),
  );
  const formatInstructions = parser.getFormatInstructions();

  const llm = await langchain.createOpenAI(model);
  const prompt = new PromptTemplate({
    template: `You a goal, and you will respond with as best as possible rephrased goal for the write shell script.\n{format_instructions}\nHere is the goal: {goal}\nOS: {os}\nDate: {date}\n`,
    inputVariables: ['goal', 'os', 'date'],
    partialVariables: { format_instructions: formatInstructions },
  });

  const input = await prompt.format({ goal, os: os.type(), date: new Date() });
  return await llm.call(input);
}
