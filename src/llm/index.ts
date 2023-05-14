import { PromptTemplate } from 'langchain/prompts';
import { z } from 'zod';
import * as os from 'os';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { IAnalyseParams, IChatParams, IConfig, IRefactorParams, ShellScriptResponse } from '../types';
import { OpenAI, OpenAIChat } from 'langchain/llms/openai';
import fs from 'fs';
import { throwLLMParseError } from '../utils/error';
import { ChatCompletionRequestMessage } from 'openai';

export class LLMCommand {
  protected llm: OpenAI;

  constructor(config: IConfig, maxTokens: number, streaming: boolean) {
    this.llm = new OpenAI(
      {
        modelName: config.MODEL,
        maxTokens,
        temperature: 0,
        openAIApiKey: config.OPENAI_API_KEY,
        streaming,
      },
      {
        basePath: config.OPEN_AI_BASE_URL,
      },
    );
  }
}

export class LLMGenerateShell extends LLMCommand {
  constructor(config: IConfig) {
    super(config, 1024, false);
  }

  async generateShell(prompt: string): Promise<ShellScriptResponse> {
    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        shellScript: z.string().describe(`shell script with comments`),
        isDangerous: z.boolean().describe(`if the shell is very dangerous, it will be marked as dangerous`),
        description: z.string().describe(`short description`),
      }),
    );

    const promptTemplate = new PromptTemplate({
      template: `
Goal: Write the best shell script based on the prompt: \`{prompt}\`

Constraints:
- should be compatible with the {os}.
- Should work without user intervention and should not require keyboard input.
- Every step should be printed to the console so that the user can understand what is happening.
- Check the installed packages and install the missing packages if necessary.
- If you need to create a file use operator "Here Document" (<<) to create a multiline string:
\`\`\`
cat << EOF > file.txt
{{content}}
EOF
\`\`\`
 
Recommendations:
- Use best practices

Answer:
- Only valid, otherwise the answer will be rejected.

{format_instructions}
The current time and date is {date}
The current working directory is {workdir}
`,
      inputVariables: ['prompt', 'os', 'date', 'workdir'],
      partialVariables: { format_instructions: parser.getFormatInstructions() },
    });

    const input = await promptTemplate.format({
      prompt,
      os: os.platform(),
      date: new Date().toLocaleString(),
      workdir: process.cwd(),
    });

    const response = await this.llm.call(input);
    try {
      return parser.parse(response);
    } catch (error) {
      return throwLLMParseError();
    }
  }

  static async generateShell(config: IConfig, prompt: string): Promise<ShellScriptResponse> {
    return new LLMGenerateShell(config).generateShell(prompt);
  }
}

export class LLMCode extends LLMCommand {
  constructor(config: IConfig) {
    super(config, 2056, true);
  }

  async generateTest({
    content,
    output,
    prompt,
    handleLLMStart,
    handleLLMEnd,
    handleLLMError,
  }: IRefactorParams): Promise<void> {
    const promptTemplate = new PromptTemplate({
      template: `
Goal: Generate tests for the following code as much as possible.
Constraints:
- The code should be formatted according to the standard for that programming language.

Recommendations:
- Use the best testing framework for the programming language.

Output format:
- Should be only tests code, otherwise the answer will be rejected.


${prompt ? `Prompt for generating tests: \`\`\`${prompt}\`\`\`` : ''}
The content: {content}
      `,
      inputVariables: ['content', 'date', 'output'],
    });
    const input = await promptTemplate.format({
      content,
      date: new Date().toISOString(),
      prompt,
      output,
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

  static async generateTest(
    params: IRefactorParams & {
      config: IConfig;
    },
  ): Promise<void> {
    return new LLMCode(params.config).generateTest(params);
  }
}

export class LLMChat extends LLMCommand {
  private llmChat: OpenAIChat;
  static messages: ChatCompletionRequestMessage[] = [];
  constructor(config: IConfig) {
    super(config, 1024, false);
    this.llmChat = new OpenAIChat({
      prefixMessages: LLMChat.messages,
      modelName: config.MODEL,
      maxTokens: 256,
      temperature: 0,
      openAIApiKey: config.OPENAI_API_KEY,
      streaming: true,
    });
  }

  async chat({
    input,
    prompt,
    handleLLMNewToken,
    handleLLMStart,
    handleLLMEnd,
    handleLLMError,
  }: IChatParams): Promise<void> {
    const messages = LLMChat.messages;
    if (input === '') {
      LLMChat.messages = [];
      handleLLMStart();
      handleLLMNewToken('Chat history cleared');
      return handleLLMEnd();
    }
    if (messages.length === 0) {
      messages.push({
        role: 'system',
        content: prompt || 'You are a helpful assistant that answers in language understandable to humans.',
      });
    }

    const answer = await this.llmChat.call(input, undefined, [
      {
        handleLLMNewToken,
        handleLLMStart,
        handleLLMEnd,
        handleLLMError,
      },
    ]);
    messages.push({
      role: 'user',
      content: input,
    });

    messages.push({
      role: 'assistant',
      content: answer,
    });
  }

  static async chat(
    params: IChatParams & {
      config: IConfig;
    },
  ): Promise<void> {
    return new LLMChat(params.config).chat(params);
  }
}

export class LLMAnalyse extends LLMCommand {
  constructor(config: IConfig) {
    super(config, 256, true);
  }
  async analyse({
    errorOutput,
    command,
    handleLLMNewToken,
    handleLLMStart,
    handleLLMEnd,
    handleLLMError,
  }: IAnalyseParams): Promise<string> {
    const promptTemplate = new PromptTemplate({
      template: `
Recommendations:
- If the error is in the code, try to fix the error in the code.
- If the error is in the command, try to fix the command.
- Try to use fewer tokens to avoid exceeding the limit.

Format of the answer is strictly as follows:
Description: {{description}}

Suggestions for fixing the error:
- {{fix1}}
- {{fix2}}
- {{fix3}}


The current time and date is {date}
The current working directory is {workdir}
The current platform is {os}
The command: {command}
The error output: {error_output}
`,
      inputVariables: ['error_output', 'command', 'os', 'workdir', 'date'],
    });

    const input = await promptTemplate.format({
      error_output: errorOutput,
      os: os.platform(),
      command,
      workdir: process.cwd(),
      date: new Date().toLocaleString(),
    });

    return this.llm.call(input, undefined, [
      {
        handleLLMNewToken,
        handleLLMStart,
        handleLLMEnd,
        handleLLMError,
      },
    ]);
  }

  static async analyse(
    params: IAnalyseParams & {
      config: IConfig;
    },
  ): Promise<string> {
    return new LLMAnalyse(params.config).analyse(params);
  }
}

export class LLMPreCommit extends LLMCommand {
  constructor(config: IConfig) {
    super(config, 256, true);
  }

  async preCommit(diff: string): Promise<string> {
    const promptTemplate = new PromptTemplate({
      template: `"Generate a commit message for the following git diff:
      Recommendations:
      - Use best practices for the commit message.
      
      Answer format:
      - Return only the commit message, otherwise the answer will be rejected.
      
      The diff: 
      \`\`\`
      {diff}
      \`\`\`
      `,
      inputVariables: ['diff'],
    });
    const input = await promptTemplate.format({
      diff: diff.trim(),
    });

    return this.llm.call(input);
  }

  static async preCommit(params: { config: IConfig; diff: string }): Promise<string> {
    return new LLMPreCommit(params.config).preCommit(params.diff);
  }
}
