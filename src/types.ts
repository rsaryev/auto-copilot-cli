export interface IConfig {
  OPENAI_API_KEY: string;
  TEMPERATURE: number;
  MODEL: string;
  EDITOR: string;
}

export interface ShellScript {
  shell_script: string;
  dangerous: boolean;
  description: string;
  error: string;
}

export interface IRefactorParams {
  content: string;
  output: string;
  handleLLMStart: () => void;
  handleLLMEnd: () => void;
  handleLLMError: (e: any) => void;
}
