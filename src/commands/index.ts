import { ICommandArgs, IConfig } from '../types';
import { askGoal, askOpenAIKey } from '../utils';
import { Command } from 'commander';
import { getConfig, setConfig } from '../config/config';
import axios, { AxiosError } from 'axios';
import chalk from 'chalk';
import { checkUpdate } from '../utils/update';
import { ChatCommand } from './chat';
import { RefactorCommand } from './refactor';
import { ShellCommand } from './shell';
import { checkNodeVersion } from '../utils/helpers';
import { AnalyzeCommand } from './analyze';

class CommandHandler {
  private readonly handlers: ((args: ICommandArgs, program: Command) => Promise<void>)[];

  constructor(private readonly config: IConfig) {
    this.handlers = [
      this.handleOpenAPIKeyOption,
      this.handleModelOption,
      this.handleEditorOption,
      this.handleBaseUrlOption,
      this.handleChatOption,
      this.handleRefactorOption,
      this.handleAnalyzeOption,
      this.handleShellOption,
    ];
    this.config = config;
  }

  public async handleOpenAPIKeyOption(args: ICommandArgs): Promise<void> {
    if (args.openaiApiKey) {
      this.config.OPENAI_API_KEY = args.openaiApiKey;
      setConfig(this.config);
    }
  }

  public async handleModelOption(args: ICommandArgs): Promise<void> {
    if (args.model) {
      this.config.MODEL = args.model;
      setConfig(this.config);
    }
  }

  public async handleEditorOption(args: ICommandArgs): Promise<void> {
    if (args.editor) {
      this.config.EDITOR = args.editor;
      setConfig(this.config);
    }
  }

  public async handleBaseUrlOption(args: ICommandArgs): Promise<void> {
    if (args.baseUrl) {
      this.config.OPEN_AI_BASE_URL = args.baseUrl;
      setConfig(this.config);
    }
  }

  public async handleChatOption(args: ICommandArgs): Promise<void> {
    if (args.chat) {
      const chatCommand = new ChatCommand(this.config);
      await chatCommand.execute(args.chat, args.prompt);
    }
  }

  public async handleRefactorOption(args: ICommandArgs): Promise<void> {
    if (args.refactor) {
      const refactorCommand = new RefactorCommand(this.config);
      await refactorCommand.execute(args.refactor, args.prompt);
    }
  }

  public async handleShellOption(args: ICommandArgs, program: Command): Promise<void> {
    if (program.args.length > 0) {
      const goal = program.args.join(' ').trim() || (await askGoal());
      const shellCommand = new ShellCommand(this.config);
      await shellCommand.execute(goal);
    }
  }

  public async handleAnalyzeOption(args: ICommandArgs): Promise<void> {
    if (args.exec) {
      const analyseCommand = new AnalyzeCommand(this.config);
      await analyseCommand.execute(args.exec);
    }
  }
  public async handleCommandAction(args: ICommandArgs, program: Command): Promise<void> {
    try {
      checkNodeVersion();
      await checkUpdate();
      for (const handler of this.handlers) {
        await handler.call(this, args, program);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if ((error as AxiosError).response?.status === 401) {
          this.config.OPENAI_API_KEY = await askOpenAIKey();
          setConfig(this.config);
          await this.handleCommandAction(args, program);
          return;
        }
      }
      console.log(`${chalk.red('✘')} ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

export async function handleCommandAction(args: ICommandArgs, program: Command): Promise<void> {
  const config = getConfig();
  const handler = new CommandHandler(config);
  await handler.handleCommandAction(args, program);
}
