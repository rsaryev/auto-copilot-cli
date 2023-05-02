import * as os from 'os';

export const CREATE_CLI_PROMPT = `I want you to create 0-10 a commands (${os.type()}) for the AI system which works with the command to achieve the goal of {goal}.Skip interaction with the command line by the user. I want you to only reply with a JSON-parseable array of commands and nothing else. do not write explanations. Only array of commands. Example output: "["git add .", "git commit -m 'Add changes'", "git push"]" or "[]" if there are no commands.`;
export const REPHRASE_GOAL_PROMPT = `I want you to rephrase the following of {goal} as a goal for the AI system which works with the command line. Answer as a string. For example: add changes to git branch`;
export const FIX_CLI_PROMPT = `I want you to fix the following command {command} for the AI system which works with the command line. Error: {error}. Answer with only one line. For example: add changes to git branch`;
