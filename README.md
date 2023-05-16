<p align="center">
  <img src="https://github.com/rsaryev/auto-copilot-cli/assets/70219513/e7b250a0-e5a5-43ee-b4ba-1c15f1096064" width="600" alt="Auto Copilot CLI">
</p>


[![npm](https://img.shields.io/npm/v/auto-copilot-cli)](https://www.npmjs.com/package/auto-copilot-cli)
[![Node.js Package](https://github.com/rsaryev/auto-copilot-cli/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/rsaryev/auto-copilot-cli/actions/workflows/npm-publish.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/transitive-bullshit/chatgpt-api/blob/main/license)
[![auto-copilot-cli npm downloads](https://img.shields.io/npm/dt/auto-copilot-cli)](https://www.npmjs.com/package/auto-copilot-cli)

## Description

This is a CLI tool for code review, generating tests, refactoring code, chatting with AI, generating and executing shell commands, and translating natural language to SQL.

## [Usage](https://github.com/rsaryev/auto-copilot-cli/blob/main/docs/usage.md)

## Installation

```bash
npm install -g auto-copilot-cli
```

Install Script:

```bash
curl -s https://raw.githubusercontent.com/rsaryev/auto-copilot-cli/main/deployment/deploy.bash | bash
```

### Commands

<details>
  <summary>List of commands</summary>

- `code-review` - Code review
- `test <file>` - Generate test
    - Options:
        - `-p, --prompt <prompt>` - Prompt for AI
        - `-o, --output <file>` - Output file
- `refactor <file>` - Refactor code
    - Options:
        - `-p, --prompt <prompt>` - Prompt for AI
        - `-o, --output <file>` - Output file
-  `sql-translator <query>` - Translate natural language to SQL
    - Options:
        - `-o, --output <output>` - Output sql file
        - `-s, --schema-path <schemaPath>` - Path to schema file (sql, prisma, any format)
- `chat <chat>` - Chat with AI
    - Options:
        - `-p, --prompt <prompt>` - Prompt for AI
- `shell <goal>` - Generate and execute a shell command
- `pre-commit` - Analyzes git diff and generates a commit message
    - Options:
        - `-y, --yes` - Skip confirmation
- `analyze <exec>` - Experimental feature, analyze error message and suggest a solution
- `config <key> <value>` - Set config
- `get-config` - Print config

### Options

- `-h, --help` - display help for command
- `-V, --version` - output the version number

</details>

## Contributing

Contributions are always welcome!
