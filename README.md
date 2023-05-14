# Auto Copilot CLI

![logo](https://user-images.githubusercontent.com/70219513/236394679-7b1f4ac4-4454-4e91-97ea-41326d1df5b4.png)

[![npm](https://img.shields.io/npm/v/auto-copilot-cli)](https://www.npmjs.com/package/auto-copilot-cli)
[![Node.js Package](https://github.com/rsaryev/auto-copilot-cli/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/rsaryev/auto-copilot-cli/actions/workflows/npm-publish.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/transitive-bullshit/chatgpt-api/blob/main/license)
[![auto-copilot-cli npm downloads](https://img.shields.io/npm/dt/auto-copilot-cli)](https://www.npmjs.com/package/auto-copilot-cli)

## Description

This is a CLI tool for generating tests, refactoring code, chatting with AI, generating and executing shell commands, and analyzing error messages.

<h2 align="center">Demo</h2>

<details>
  <summary>Click to view demo</summary>

https://github.com/rsaryev/auto-copilot-cli/assets/70219513/08fd6f15-133d-4fdd-8a1a-aa350d17ce1e

</details>

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

- `test <file>` - Generate test
    - Options:
        - `-p, --prompt <prompt>` - Prompt for AI
        - `-o, --output <file>` - Output file
- `refactor <file>` - Refactor code
    - Options:
        - `-p, --prompt <prompt>` - Prompt for AI
        - `-o, --output <file>` - Output file
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

## Usage

<details>
  <summary>Pre-commit</summary>

```bash
# Analyzes git diff and generates a commit message
$ copilot pre-commit

# Analyzes git diff and generates a commit message with skip confirmation
$ copilot pre-commit -y
```

</details>

<details>
  <summary>Refactor code</summary>

```bash
# Refactor code
$ copilot refactor ./server.js

# Refactor code with prompt
$ copilot refactor ./server.js -p "use typescript"

# Refactor code with prompt and output
$ copilot refactor ./server.js -p "use typescript" -o ./server.ts
```

</details>

<details>
  <summary>Generate test</summary>

```bash
# Generate test
$ copilot test ./server.js

# Generate test with prompt
$ copilot test ./server.js -p "use jest framework"

# Generate test with prompt and output
$ copilot test ./server.js -p "use jest framework" -o ./server.test.js
```

</details>

<details>
  <summary>Chat with AI</summary>

```bash
# Chat with AI
$ copilot chat "How are you?"

# Chat with AI with prompt
$ copilot chat "How many types in typescript are there?" -p "Software Engineering"
```

</details>

<details>
  <summary>Generate and execute a shell command</summary>

```bash
# Rename all files in the current directory to lowercase
$ copilot shell "rename files in the current directory to lowercase"

# Convert all images in the current directory to size 100x100
$ copilot shell "convert all images in the current directory to size 100x100"

# Create a file with implementation of binary search
$ copilot shell "create a js file with implementation of binary search"

# Create a simple web server in Node.js using Koajs
$ copilot shell "create a simple web server in Node.js using Koajs"

# Start PostgreSQL in Docker
$ copilot shell "start PostgreSQL in Docker"
```

</details>

<details>
  <summary>Analyze error message</summary>

```bash
# Analyze error message
$ copilot analyze "node ./server.js"
```

</details>

<details>
  <summary>Set Config</summary>

```bash
# Set openai api key
$ copilot config OPENAI_API_KEY <api_key>

# Set openai base url
$ copilot config OPEN_AI_BASE_URL <base_url>

# Set openai model
$ copilot config MODEL <model>
```

</details>

<details>
  <summary>Get Config</summary>

```bash
# Print config
$ copilot get-config
```

</details>

## Contributing

Contributions are always welcome!
