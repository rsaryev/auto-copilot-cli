import { PromptTemplate } from 'langchain/prompts';
import { z } from 'zod';
import * as os from 'os';
import fs from 'fs';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { langchain } from '../libs/langchain';
import { ShellScript } from '../types';

export const LLMGenerateShell = async (
  prompt: string,
  model: string,
): Promise<ShellScript> => {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      shell_script: z.string().describe(`shell script with comments`),
      dangerous: z
        .boolean()
        .describe(
          `if the shell is very dangerous, it will be marked as dangerous`,
        ),
      description: z.string().describe(`short description`),
    }),
  );

  const formatInstructions = parser.getFormatInstructions();

  const promptTemplate = new PromptTemplate({
    template: `
You are in a {os} machine. You want write a $SHELL based on the prompt: {prompt}.

{format_instructions}

OS: {os}
Date: {date}
Workdir: {workdir}
`,
    inputVariables: ['prompt', 'os', 'date', 'workdir'],
    partialVariables: { format_instructions: formatInstructions },
  });

  const llm = await langchain.createOpenAI(model, false, 1024);
  const input = await promptTemplate.format({
    prompt,
    os: os.type(),
    date: new Date().toString(),
    workdir: process.cwd(),
  });

  const response = await llm.call(input);
  const parsed = await parser.parse(response);
  return parsed || [];
};

export async function LLMRefactorCode(path: string): Promise<string> {
  const promptTemplate = new PromptTemplate({
    template: `
Refactor the following code: {code}
Return the refactored code.
`,
    inputVariables: ['code', 'date'],
  });

  const code = fs.readFileSync(path, 'utf-8');
  return promptTemplate.format({
    code,
    os: os.type(),
    date: new Date().toString(),
  });
}
