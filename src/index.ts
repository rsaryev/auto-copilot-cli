import { Command } from 'commander';
// @ts-ignore
import { version } from '../package.json';
import { getConfig, setConfig } from './config/config';
import { TestCommand } from './commands/generate-tests';
import { RefactorCommand } from './commands/refactor';
import { ChatCommand } from './commands/chat';
import { ShellCommand } from './commands/shell';
import { AnalyzeCommand } from './commands/analyze';
import { IConfig } from './types';

const program: Command = new Command()
  .name('auto-copilot-cli')
  .description('Auto Copilot CLI')
  .version(version)
  .alias('copilot');

const config: IConfig = getConfig();

type IOption = {
  name: string;
  description: string;
  required: boolean;
};
type ICommand = {
  name: string;
  description: string;
  args: string;
  options: IOption[];
  action: (...args: any[]) => Promise<void>;
};

const testCommand: ICommand = {
  name: 'test',
  description: 'Generate test',
  args: '<file>',
  options: [
    {
      name: '-p, --prompt <prompt>',
      description: 'Prompt for AI',
      required: false,
    },
    {
      name: '-o, --output <output>',
      description: 'Output file',
      required: false,
    },
  ],
  action: async (file: string, options: { prompt?: string; output?: string }): Promise<void> => {
    const testCommand: TestCommand = new TestCommand(config);
    await testCommand.execute(file, options);
  },
};

const refactorCommand: ICommand = {
  name: 'refactor',
  description: 'Refactor code',
  args: '<file>',
  options: [
    {
      name: '-p, --prompt <prompt>',
      description: 'Prompt for AI',
      required: false,
    },
    {
      name: '-o, --output <output>',
      description: 'Output file',
      required: false,
    },
  ],
  action: async (file: string, options: { prompt?: string; output?: string }): Promise<void> => {
    const refactorCommand: RefactorCommand = new RefactorCommand(config);
    await refactorCommand.execute(file, options);
  },
};

const chatCommand: ICommand = {
  name: 'chat',
  description: 'Chat with AI',
  args: '<chat>',
  options: [
    {
      name: '-p, --prompt <prompt>',
      description: 'Prompt for AI',
      required: false,
    },
  ],
  action: async (message: string, options: { prompt?: string }): Promise<void> => {
    const chatCommand: ChatCommand = new ChatCommand(config);
    await chatCommand.execute(message, options);
  },
};

const shellCommand: ICommand = {
  name: 'shell',
  description: 'Generate and execute a shell command',
  args: '<goal>',
  options: [],
  action: async (goal: string): Promise<void> => {
    const shellCommand: ShellCommand = new ShellCommand(config);
    await shellCommand.execute(goal);
  },
};

const analyzeCommand: ICommand = {
  name: 'analyze',
  description: 'Experimental feature, analyze error message and suggest a solution',
  args: '<exec>',
  options: [],
  action: async (exec: string): Promise<void> => {
    const analyzeCommand: AnalyzeCommand = new AnalyzeCommand(config);
    await analyzeCommand.execute(exec);
  },
};

const configCommand: ICommand = {
  name: 'config',
  description: 'Set config',
  args: '<key> <value>',
  options: [],
  action: async (key: string, value: string): Promise<void> => {
    await setConfig({
      ...config,
      [key]: value,
    });
  },
};

const getConfigCommand: ICommand = {
  name: 'get-config',
  description: 'Print config',
  args: '',
  options: [],
  action: async (): Promise<void> => {
    const config: any = getConfig();
    console.table(Object.keys(config).map((key: string) => ({ key, value: config[key] })));
  },
};

const commands: ICommand[] = [
  testCommand,
  refactorCommand,
  chatCommand,
  shellCommand,
  analyzeCommand,
  configCommand,
  getConfigCommand,
];

commands.forEach(({ name, description, args, options, action }) => {
  const command: Command = new Command(name).description(description);
  if (args) {
    command.arguments(args);
  }
  options.forEach(({ name, description, required }) => {
    command.option(name, description, required);
  });
  command.action(action);
  program.addCommand(command);
});

program.parse(process.argv);
