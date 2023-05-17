[![npm](https://img.shields.io/npm/v/auto-copilot-cli)](https://www.npmjs.com/package/auto-copilot-cli)
[![Node.js Package](https://github.com/rsaryev/auto-copilot-cli/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/rsaryev/auto-copilot-cli/actions/workflows/npm-publish.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/transitive-bullshit/chatgpt-api/blob/main/license)
[![auto-copilot-cli npm downloads](https://img.shields.io/npm/dt/auto-copilot-cli)](https://www.npmjs.com/package/auto-copilot-cli)

<p align="center">
    <img src="https://github.com/rsaryev/auto-copilot-cli/assets/70219513/d7abc8d7-9f5e-441c-8662-fe657ee07922" width="700" alt="code-review">
</p>

## Description

This is a CLI tool that provides various functionalities such as code review, test generation, code refactoring, AI
chat, shell command generation and execution, and natural language to SQL translation.

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

<details>
  <summary>List of commands</summary>

- `code-review` - Perform code review
- `test <file>` - Generate test
    - Options:
        - `-p, --prompt <prompt>` - Prompt for AI
        - `-o, --output <file>` - Output file
- `refactor <file>` - Refactor code
    - Options:
        - `-p, --prompt <prompt>` - Prompt for AI
        - `-o, --output <file>` - Output file
- `sql-translator <query>` - Translate natural language to SQL
    - Options:
        - `-o, --output <output>` - Output sql file
        - `-s, --schema-path <schemaPath>` - Path to schema file (sql, prisma, any format)
- `chat <chat>` - Chat with AI
    - Options:
        - `-p, --prompt <prompt>` - Prompt for AI
- `shell <goal>` - Generate and execute a shell command
- `pre-commit` - Analyze git diff and generate a commit message
    - Options:
        - `-y, --yes` - Skip confirmation
- `analyze <exec>` - Experimental feature, analyze error message and suggest a solution
- `config <key> <value>` - Set configuration
- `get-config` - Print configuration

### Options

- `-h, --help` - Display help for command
- `-V, --version` - Output the version number

</details>

## Contributing

Contributions are always welcome!
