import { PromptTemplate } from 'langchain/prompts';
import { z } from 'zod';
import * as os from 'os';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { IConfig, IRefactorParams, ShellScript } from '../types';
import { OpenAI } from 'langchain/llms/openai';
import fs from 'fs';
import { throwLLMParseError } from '../utils/error';

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

  async wrappedParse<T>(
    parser: StructuredOutputParser<any>,
    response: string,
  ): Promise<T> {
    try {
      return parser.parse(response);
    } catch (error) {
      return throwLLMParseError();
    }
  }

  async generateShell(prompt: string): Promise<ShellScript> {
    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        shell_script: z.string().describe(`shell script with comments`),
        dangerous: z
          .boolean()
          .describe(
            `if the shell is very dangerous, it will be marked as dangerous`,
          ),
        description: z.string().describe(`short description`),
        error: z.string().describe(`short error`),
      }),
    );

    const formatInstructions = parser.getFormatInstructions();

    const promptTemplate = new PromptTemplate({
      template: `
Goal: Write the best shell script based on the prompt: \`{prompt}\`

Constraints:
- The script should be compatible with the specified environment {os}.
- The script should run without any user assistance.
- Every step should be printed to the console so that the user can understand what is happening.
- Check the installed packages and install the missing packages if necessary.
- If you need to create a file with a code in shell script, use \`cat > filename << EOF.
 
Recommendations:
- Use best practices

Answer:
- Only valid, otherwise the answer will be rejected.

{format_instructions}
The current time and date is ${new Date().toLocaleString()}
The current working directory is {workdir}
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
    return this.wrappedParse(parser, response);
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
    prompt,
    handleLLMStart,
    handleLLMEnd,
    handleLLMError,
  }: IRefactorParams): Promise<void> {
    const promptTemplate = new PromptTemplate({
      template: `Refactor and fix the following content

Constraints:
- If this is code in a programming language, it must be formatted according to the standard for that programming language and run without errors.

Recommendations:
- Use best practices for the content.

Answer format:
- Return only refactored valid content, otherwise the answer will be rejected. 

${prompt ? `Prompt for refactoring: \`\`\`${prompt}\`\`\`` : ''}
The content: {content}
      `,
      inputVariables: ['content', 'date'],
    });

    const input = await promptTemplate.format({
      content,
      date: new Date().toISOString(),
      prompt,
    });

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
