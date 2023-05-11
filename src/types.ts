export interface IConfig {
  OPENAI_API_KEY: string;
  TEMPERATURE: number;
  MODEL: string;
  EDITOR: string;
  OPEN_AI_BASE_URL: string;
}

export interface ShellScriptResponse {
  shellScript: string;
  isDangerous: boolean;
  description: string;
}

export interface IRefactorParams {
  content: string;
  output: string;
  prompt?: string;
  handleLLMStart: () => void;
  handleLLMEnd: () => void;
  handleLLMError: (e: any) => void;
}

export interface IChatParams {
  input: string;
  prompt?: string;
  handleLLMNewToken: (token: string) => void;
  handleLLMStart: () => void;
  handleLLMEnd: () => void;
  handleLLMError: (e: Error) => void;
}
export abstract class Command {
  protected readonly config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  abstract execute(command: string): Promise<void>;
}
