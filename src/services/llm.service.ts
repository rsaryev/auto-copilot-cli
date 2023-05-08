import { PromptTemplate } from 'langchain/prompts';
import { z } from 'zod';
import * as os from 'os';
import fs from 'fs';
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
      'You have a goal, and you will respond with a shell script that will execute tasks for this goal.\nHere is the goal: {goal}\n{format_instructions}\nOS: {os}\nDate: {date}\nWorkdir: {workdir}\n',
    inputVariables: ['goal', 'os', 'date', 'workdir'],
    partialVariables: { format_instructions: formatInstructions },
  });

  const llm = await langchain.createOpenAI(model);
  const input = await prompt.format({
    goal,
    os: os.type(),
    date: new Date().toString(),
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
    template: `You have a goal, and you will respond with the best possible rephrased goal for writing a shell script.\n{format_instructions}\nHere is the goal: {goal}\nOS: {os}\nDate: {date}\n`,
    inputVariables: ['goal', 'os', 'date'],
    partialVariables: { format_instructions: formatInstructions },
  });

  const input = await prompt.format({
    goal,
    os: os.type(),
    date: new Date().toString(),
  });
  return llm.call(input);
}

export async function LLMRefactorCode(path: string): Promise<string> {
  const prompt = new PromptTemplate({
    template:
      'You have to refactor the code using best practices. The answer should only be refactored code.\nHere is the code: {code}\nOS: {os}\nDate: {date}\n',
    inputVariables: ['code', 'os', 'date'],
  });

  const code = fs.readFileSync(path, 'utf-8');
  return prompt.format({
    code,
    os: os.type(),
    date: new Date().toString(),
  });
}
