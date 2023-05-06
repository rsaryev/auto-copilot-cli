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
      shell_script: z.string().describe(`shell script with comments`),
      dangerous: z
        .boolean()
        .describe(
          `if the shell is very dangerous, it will be marked as dangerous`,
        ),
    }),
  );

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: `You a goal, and you will respond with a shell script to achieve the goal.
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
