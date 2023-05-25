import { PromptTemplate } from 'langchain/prompts';
import { z } from 'zod';
import * as os from 'os';
import { IAnalyseParams, IChatParams, IConfig, IRefactorParams, ShellScriptResponse } from '../types';
import { OpenAI, OpenAIChat } from 'langchain/llms/openai';
import fs from 'fs';
import { throwLLMParseError } from '../utils/error';
import { ChatCompletionRequestMessage } from 'openai';
import path from 'path';
import { AiValidator } from 'ai-validator';
import { getPackageManagerByOs } from '../utils/helpers';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RetrievalQAChain } from 'langchain/chains';
import { inputAsk } from '../utils';
import ora from 'ora';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { extensionsList } from '../utils/language-extensions';

export class LLMCommand {
  protected llm: OpenAI;
  protected config: IConfig;

  constructor(config: IConfig, maxTokens: number, streaming: boolean, temperature = 0) {
    this.config = config;
    this.llm = new OpenAI(
      {
        modelName: config.MODEL,
        maxTokens,
        temperature,
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
    const packageManager = this.config.PACKAGE_MANAGER || getPackageManagerByOs();
    const schema = z.object({
      shellScript: z.string().describe(`shell script with comments`),
      isDangerous: z.boolean().describe(`if the shell is very dangerous, it will be marked as dangerous`),
      description: z.string().describe(`short description`),
    });
    const validator = AiValidator.input`
Goal: Write the best shell script based on the prompt: \`${prompt}\`

Constraints for the shell script:
- should be compatible with the ${os.platform()}.
- Should work without user intervention and should not require keyboard input.
- Every step should be printed to the console so that the user can understand what is happening.
- Check the installed packages and install the missing packages if necessary.
- If you need to create a file use operator "Here Document" (<<) to create a multiline string:
\`\`\`
cat << EOF > file.txt
{{content}}
EOF
\`\`\`
- Use package manager ${packageManager}
 
Recommendations:
- Use best practices
- Use the best tools for the job
- Use the best practices for writing shell scripts

${schema}
The current time and date is ${new Date().toLocaleString()}
The current working directory is ${process.cwd()}
The current os platform is ${os.platform()}
`;
    const response = await this.llm.call(validator.prompt());
    try {
      return validator.parse(response);
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

  async translateSql(params: IRefactorParams): Promise<void> {
    const promptTemplate = new PromptTemplate({
      template: `
Goal: Based on the following prompt translate the natural language to sql.
Constraints:
- The sql should be formatted according to the standard for that sql language.

Recommendations:
- Use the best practices for writing sql.

Output format:
- Should be only sql, otherwise the answer will be rejected.


The prompt: {prompt}
The schema: {schema}
      `,
      inputVariables: ['output', 'prompt', 'schema'],
    });

    const writeStream = fs.createWriteStream(params.output);
    const input = await promptTemplate.format({
      prompt: params.prompt,
      output: params.output,
      schema: params.content.trim(),
    });

    await this.llm.call(input, undefined, [
      {
        handleLLMStart: params.handleLLMStart,
        handleLLMNewToken(token: string) {
          writeStream.write(token);
        },
        handleLLMEnd() {
          params.handleLLMEnd();
          writeStream.end();
        },
        handleLLMError(e): Promise<void> | void {
          params.handleLLMError(e);
          writeStream.end();
        },
      },
    ]);
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

  static async translateSql(
    params: IRefactorParams & {
      config: IConfig;
    },
  ): Promise<void> {
    return new LLMCode(params.config).translateSql(params);
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
    super(config, 256, false, 0.7);
  }

  async preCommit(diff: string): Promise<{
    title: string;
    messages?: string[];
  }> {
    const schemaWithMessages = z.object({
      title: z.string().describe('The title of short description of the changes'),
      messages: z.array(z.string()).describe('paragraphs describing the changes'),
    });

    const schemaWithOptionalMessages = z.object({
      title: z.string().describe('The title of the commit'),
    });

    const schema = this.config.INCLUDE_COMMIT_DESCRIPTION === 'yes' ? schemaWithMessages : schemaWithOptionalMessages;
    const validator = AiValidator.input`You are reviewing the git diff and writing a git commit.
Constraints:
- Use format Conventional Commits.

${schema}
The git diff: 
\`\`\`${diff}\`\`\`
      `;
    const response = await this.llm.call(validator.prompt());
    try {
      return await validator.parse(response.replace(/\\n/g, '\n'));
    } catch (error) {
      return throwLLMParseError();
    }
  }

  static async preCommit(params: { config: IConfig; diff: string }): Promise<{
    title: string;
    messages?: string[];
  }> {
    return new LLMPreCommit(params.config).preCommit(params.diff);
  }
}

export class LLMCodeReview extends LLMCommand {
  constructor(config: IConfig) {
    super(config, 256, true, 0);
  }

  async codeReview(params: {
    content: string;
    filePath: string;
    handleLLMNewToken: (token: string) => Promise<void>;
    handleLLMStart: () => Promise<void>;
    handleLLMEnd: () => Promise<void>;
    handleLLMError: (error: Error) => Promise<void>;
  }): Promise<string> {
    const fullFilePath = path.resolve(process.cwd(), params.filePath);
    const promptTemplate = new PromptTemplate({
      template: `You are an automatic assistant who helps with Code Review.
The goal is to improve the quality of the code and ensure the effective operation of the application in terms of security, scalability, and ease of maintenance.
During the analysis, you should pay attention to the use of best programming practices, code optimization, security, and compliance with coding standards.

Constraints:
- Always specify where exactly in the code "In ${fullFilePath}:line:column" and what exactly "Need to fix like this".
- Do not suggest fixes that do not improve the code or fix errors.
- Be concise and accurate.

Answer only valid, otherwise the answer will be rejected.
\`\`\`
🤖 ${fullFilePath}:{{line}}:{{column}} 
💡 {{suggestion}}
\`\`\`,

\`\`\`{code}\`\`\``,
      inputVariables: ['code'],
    });

    const codeWithLineNumbers = params.content
      .split('\n')
      .map((line, index) => `/*${index + 1}*/ ${line}`)
      .join('\n')
      .trim();
    const input = await promptTemplate.format({
      code: codeWithLineNumbers,
    });

    const response = await this.llm.call(input, undefined, [
      {
        handleLLMNewToken: params.handleLLMNewToken,
        handleLLMStart: params.handleLLMStart,
        handleLLMEnd: params.handleLLMEnd,
        handleLLMError: params.handleLLMError,
      },
    ]);
    return response;
  }

  static async codeReview(params: {
    config: IConfig;
    content: string;
    filePath: string;
    handleLLMNewToken: (token: string) => Promise<void>;
    handleLLMStart: () => Promise<void>;
    handleLLMEnd: () => Promise<void>;
    handleLLMError: (error: Error) => Promise<void>;
  }): Promise<string> {
    return new LLMCodeReview(params.config).codeReview({
      content: params.content,
      filePath: params.filePath,
      handleLLMNewToken: params.handleLLMNewToken,
      handleLLMStart: params.handleLLMStart,
      handleLLMEnd: params.handleLLMEnd,
      handleLLMError: params.handleLLMError,
    });
  }
}

export class LLMLintFile extends LLMCommand {
  constructor(config: IConfig) {
    super(config, 256, true, 0);
  }

  async lintCheckFile(params: {
    files: string[];
    handleLLMNewToken: (token: string) => Promise<void>;
    handleLLMStart: () => Promise<void>;
    handleLLMEnd: () => Promise<void>;
    handleLLMError: (error: Error) => Promise<void>;
  }): Promise<void> {
    const promptTemplate = new PromptTemplate({
      template: `You are an assistant who helps with organizing files and folders.
Your goal is to analyze and suggest a better structure files and folders for the project.

Constraints:
- Always specify where exactly in the code "In {{path}}" and what exactly "Need to fix like this".
- Do not suggest fixes that do not improve the project structure.
- Be concise and accurate.
- Use best practices and standards for naming files and folders.
- No suggestions for files and folders that are not in the project.

Answer only valid, otherwise the answer will be rejected.
\`\`\`
🤖 {{path}}
💡 {{suggestionNewPath}}
💬 {{description}}
\`\`\`

output: {files}
`,
      inputVariables: ['files'],
    });

    const input = await promptTemplate.format({
      files: params.files,
    });

    await this.llm.call(input, undefined, [
      {
        handleLLMNewToken: params.handleLLMNewToken,
        handleLLMStart: params.handleLLMStart,
        handleLLMEnd: params.handleLLMEnd,
        handleLLMError: params.handleLLMError,
      },
    ]);
  }

  static async analyse(params: {
    files: string[];
    config: IConfig;
    handleLLMNewToken: (token: string) => Promise<void>;
    handleLLMStart: () => Promise<void>;
    handleLLMEnd: () => Promise<void>;
    handleLLMError: (error: Error) => Promise<void>;
  }) {
    return new LLMLintFile(params.config).lintCheckFile(params);
  }
}

export class LLMCodeChat extends LLMCommand {
  private vectorStore: any;
  constructor(config: IConfig) {
    super(config, 1024, true);
  }

  private async getOrCreateVectorStore(directory: string): Promise<void> {
    const VECTOR_STORE_PATH = path.join('vector-store');
    if (fs.existsSync(VECTOR_STORE_PATH)) {
      this.vectorStore = await HNSWLib.load(
        VECTOR_STORE_PATH,
        new OpenAIEmbeddings({
          openAIApiKey: this.config.OPENAI_API_KEY,
        }),
      );
      return;
    }

    const loader = new DirectoryLoader(
      directory,
      extensionsList.reduce((acc, ext) => {
        acc[ext] = (path) => new TextLoader(path);
        return acc;
      }, {}),
    );

    const rawDocs = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter();
    const docs = await textSplitter.splitDocuments(rawDocs);
    const vectorStore = await HNSWLib.fromDocuments(
      docs,
      new OpenAIEmbeddings({
        openAIApiKey: this.config.OPENAI_API_KEY,
      }),
    );

    await vectorStore.save(VECTOR_STORE_PATH);
    this.vectorStore = vectorStore;
  }

  async chat(params: IChatParams): Promise<void> {
    const prompt = params.prompt
      ? params.prompt
      : 'You are an AI assistant for working with code. You goal is to help developers with their questions about code.';
    const promptTemplate = new PromptTemplate({
      template: `${prompt} \nquestion: {question}`,
      inputVariables: ['question'],
    });

    const chain = RetrievalQAChain.fromLLM(this.llm, this.vectorStore.asRetriever(2), {
      returnSourceDocuments: true,
    });

    const question = await inputAsk();
    const input = await promptTemplate.format({
      question,
    });
    const res = await chain.call({ query: input }, [
      {
        handleLLMNewToken: params.handleLLMNewToken,
        handleLLMStart: params.handleLLMStart,
        handleLLMEnd: params.handleLLMEnd,
        handleLLMError: params.handleLLMError,
      },
    ]);
    process.stdout.write('\n' + res.sourceDocuments.map((doc) => `📄 ${doc.metadata.source}:`).join('\n') + '\n');

    return this.chat(params);
  }

  static async chat({
    config,
    directory,
    ...params
  }: IChatParams & { config: IConfig; directory: string }): Promise<void> {
    const llmCodeChat = new LLMCodeChat(config);
    const spinner = ora('Loading vector store...').start();
    try {
      await llmCodeChat.getOrCreateVectorStore(directory);
    } catch (error) {
      spinner.fail('Failed to load vector store');
      throw error;
    }
    spinner.succeed('Vector store loaded');
    return llmCodeChat.chat(params);
  }
}
