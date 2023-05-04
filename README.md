# Auto Copilot CLI

[![npm](https://img.shields.io/npm/v/auto-copilot-cli)](https://www.npmjs.com/package/auto-copilot-cli)

### Quick Start

1. Install the CLI tool globally using npm ```npm i -g auto-copilot-cli```
2. Get your OpenAI API key from https://platform.openai.com/account/api-keys
3. Run the CLI tool using ```auto-copilot-cli``` or ```auto-copilot create nestjs project```
4. Enter your OpenAI API key when prompted
5. Setup an alias for the ```auto-copilot-cli``` command, for example ```ac```

### Commands

- ```auto-copilot-cli``` - Starts the CLI tool and not auto execute tasks
- ```auto-copilot-cli --a``` - Starts the CLI tool and auto execute tasks if the command is safe else it will ask for confirmation

### Examples using the CLI tool
- ```auto-copilot-cli create 10 empty files with names from 1 to 10``` - Creates 10 empty files with names from 1 to 10
- ```auto-copilot-cli create koa.js project``` - Creates a Koa.js project
- ```auto-copilot-cli start postgresql in docker``` - Starts PostgreSQL in Docker
- ```auto-copilot-cli create pdf file with top 10 movies``` - Creates a PDF file with top 10 movies
- ```auto-copilot-cli create js file with implementation of binary search``` - Creates a file with implementation of binary search

### Demo

![demo](./demo.gif)

## Description

This CLI tool uses the ChatGPT language model to create commands. This allows you to create a list of tasks and perform them sequentially, optimizing your workflow and increasing the efficiency of repetitive actions.

