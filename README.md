# Auto Copilot CLI

[![npm](https://img.shields.io/npm/v/auto-copilot-cli)](https://www.npmjs.com/package/auto-copilot-cli) [![Node.js Package](https://github.com/rsaryev/auto-copilot-cli/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/rsaryev/auto-copilot-cli/actions/workflows/npm-publish.yml) [![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/transitive-bullshit/chatgpt-api/blob/main/license)

### Quick Start

1. Install Node.js v18.16.0 or higher - https://nodejs.org/en/download/
2. Install the CLI tool globally using npm ```npm i -g auto-copilot-cli``` or  ```yarn global add auto-copilot-cli```
3. Get your OpenAI API key from https://platform.openai.com/account/api-keys
4. Run the CLI tool using ```auto-copilot-cli```
5. Enter your OpenAI API key when prompted

### Options

- ```-a, --auto-execute``` - Enable auto execute mode (default: false)
- ```-m, --model <modelName>``` - OpenAI model name (default: "gpt-3.5-turbo")
- ```-h, --help``` - display help for command
- ```-V, --version``` - output the version number

### Recommendations

- Setup an alias for the ```npx auto-copilot-cli``` command, for example ```ac``` or ```copilot```
- Use npx to run the CLI tool without installing it globally ```npx auto-copilot-cli``` using the latest version
- Use the ```-a``` flag carefully for automatic execution of commands
- Not changing the default model is recommended

### Examples using the CLI tool
- ```auto-copilot-cli create image.png with cat and open it``` - Creates an image with a cat and opens it
- ```auto-copilot-cli create 10 empty files with names from 1 to 10``` - Creates 10 empty files with names from 1 to 10
- ```auto-copilot-cli create koa.js project``` - Creates a Koa.js project
- ```auto-copilot-cli start postgresql in docker``` - Starts PostgreSQL in Docker
- ```auto-copilot-cli create pdf file with top 10 movies``` - Creates a PDF file with top 10 movies
- ```auto-copilot-cli create js file with implementation of binary search``` - Creates a file with implementation of binary search

### Setup an alias

1. Open your terminal
2. Run ```nano ~/.bashrc``` or ```nano ~/.zshrc```
3. Add ```alias copilot="auto-copilot-cli"``` to the end of the file
4. Save the file and run ```source ~/.bashrc``` or ```source ~/.zshrc```

Or try this option:

1. ```npx auto-copilot-cli setup alias for the npx auto-copilot-cli command and add it to the zshrc file with the name copilot```

### Demo

![demo](./demo.gif)

## Description

This CLI tool uses the ChatGPT language model to create commands. This allows you to create a list of tasks and perform them sequentially, optimizing your workflow and increasing the efficiency of repetitive actions.
