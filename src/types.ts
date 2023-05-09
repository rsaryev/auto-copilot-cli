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
}
