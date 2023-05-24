[![npm](https://img.shields.io/npm/v/auto-copilot-cli)](https://www.npmjs.com/package/auto-copilot-cli)
[![Node.js Package](https://github.com/rsaryev/auto-copilot-cli/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/rsaryev/auto-copilot-cli/actions/workflows/npm-publish.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/transitive-bullshit/chatgpt-api/blob/main/license)
[![auto-copilot-cli npm downloads](https://img.shields.io/npm/dt/auto-copilot-cli)](https://www.npmjs.com/package/auto-copilot-cli)

<p align="center">
  <img src="https://github.com/rsaryev/auto-copilot-cli/assets/70219513/8deb1865-6ec6-4dc8-a631-344627dabb83" width="800" alt="chat">
</p>

## Description

`auto-copilot-cli` is a versatile tool that offers several functionalities, including:

- AI chat help you quickly find and improve codebase and answer questions about codebase
- Code review
- Pre-commit for generating commit messages
- Code refactoring and linting structure of a folder or a file
- Test generation
- Shell command generation and execution
- Natural language to SQL translation


## Setup

1. Install `auto-copilot-cli` globally:
    ```bash
   # using npm
    npm install -g auto-copilot-cli
   
   # using install script
   curl -s https://raw.githubusercontent.com/rsaryev/auto-copilot-cli/main/deployment/deploy.bash | bash
    ```
2. Get an API key from [OpenAI](https://platform.openai.com/account/api-keys).
3. Refer to the [CLI usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/usage.md) guide to learn how to use
   the tool.

### Commands

- `code-chat <path>` - AI chat with codebase [usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/code-chat.md)
    - Options:
        - `-p, --prompt <prompt>` - Prompt for AI
- `lint-file` - Lint structure of a folder or a file and suggest a improvement [usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/lint-file.md) - Lint structure of a folder or a file and suggest a improvement
- `code-review` - Perform code review [usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/code-review.md) - Perform code review
- `test <file>` - Generate test [usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/test.md)
    - Options:
        - `-p, --prompt <prompt>` - Prompt for AI
        - `-o, --output <file>` - Output file
- `refactor <file>` - Refactor code [usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/refactor.md)
    - Options:
        - `-p, --prompt <prompt>` - Prompt for AI
        - `-o, --output <file>` - Output file
- `sql-translator <query>` - Translate natural language to SQL [usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/sql-translator.md)
    - Options:
        - `-o, --output <output>` - Output sql file
        - `-s, --schema-path <schemaPath>` - Path to schema file (sql, prisma, any format)
- `chat <chat>` - Chat with AI [usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/chat.md)
    - Options:
        - `-p, --prompt <prompt>` - Prompt for AI
- `shell <goal>` - Generate and execute a shell command [usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/shell.md)
- `pre-commit` - Analyze git diff and generate a commit message [usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/pre-commit.md)
    - Options:
        - `-y, --yes` - Skip confirmation
- `analyze <exec>` - Experimental feature, analyze error message and suggest a solution [usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/analyze.md)
- `config <key> <value>` - Set configuration [usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/config.md)
- `get-config` - Print configuration

### Options

- `-h, --help` - Display help for command
- `-V, --version` - Output the version number


## Contributing

Contributions are always welcome!
