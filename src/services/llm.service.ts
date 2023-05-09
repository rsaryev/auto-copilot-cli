import { PromptTemplate } from 'langchain/prompts';
import { z } from 'zod';
import * as os from 'os';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { IConfig, IRefactorParams, ShellScript } from '../types';
import { OpenAI } from 'langchain/llms/openai';
import fs from 'fs';

export class LLMGenerateShell {
  private llm: OpenAI;
  constructor(config: IConfig) {
    this.llm = new OpenAI({
      modelName: config.MODEL,
      maxTokens: 1024,
      temperature: 0,
      openAIApiKey: config.OPENAI_API_KEY,
      streaming: false,
    });
  }

  async generateShell(prompt: string): Promise<ShellScript> {
    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        shell_script: z.string().describe(`shell script`),
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
You should write a shell script based on the prompt: \`{prompt}\` so that it runs in a fully automatic mode in the environment {os} and creates files in the current directory if necessary.
Every step should be printed to the console so that the user can understand what is happening.

{format_instructions}

Date: \'{date}\'
Workdir: \'{workdir}\'
`,
      inputVariables: ['prompt', 'os', 'date', 'workdir'],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await promptTemplate.format({
      prompt: prompt,
      os: os.platform(),
      date: new Date().toISOString(),
      workdir: process.cwd(),
    });

    const response = await this.llm.call(input);
    return parser.parse(response);
  }

  static async generateShell(
    config: IConfig,
    prompt: string,
  ): Promise<ShellScript> {
    return new LLMGenerateShell(config).generateShell(prompt);
  }
}

export class LLMCode {
  private llm: OpenAI;
  constructor(config: IConfig) {
    this.llm = new OpenAI({
      modelName: config.MODEL,
      maxTokens: 2056,
      temperature: 0,
      openAIApiKey: config.OPENAI_API_KEY,
      streaming: true,
    });
  }

  async refactor({
    content,
    output,
    handleLLMStart,
    handleLLMEnd,
    handleLLMError,
  }: IRefactorParams): Promise<void> {
    const promptTemplate = new PromptTemplate({
      template: 'Refactor and fix the following code: {content}',
      inputVariables: ['content'],
    });

    const input = await promptTemplate.format({ content });
    const writeStream = fs.createWriteStream(output);

    await this.llm.call(input, undefined, [
      {
        handleLLMStart,
        handleLLMNewToken(token: string) {
          writeStream.write(token);
        },
        handleLLMEnd() {
          handleLLMEnd();
          writeStream.end();
        },
        handleLLMError(e): Promise<void> | void {
          handleLLMError(e);
          writeStream.end();
        },
      },
    ]);
  }

  static async refactor(
    params: IRefactorParams & {
      config: IConfig;
    },
  ): Promise<void> {
    return new LLMCode(params.config).refactor(params);
  }
}
