# Auto Copilot CLI
![logo](https://user-images.githubusercontent.com/70219513/236394679-7b1f4ac4-4454-4e91-97ea-41326d1df5b4.png)

[![npm](https://img.shields.io/npm/v/auto-copilot-cli)](https://www.npmjs.com/package/auto-copilot-cli) 
[![Node.js Package](https://github.com/rsaryev/auto-copilot-cli/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/rsaryev/auto-copilot-cli/actions/workflows/npm-publish.yml) 
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/transitive-bullshit/chatgpt-api/blob/main/license)
[![auto-copilot-cli npm downloads](https://img.shields.io/npm/dt/auto-copilot-cli)](https://www.npmjs.com/package/auto-copilot-cli)

## Description

Auto Copilot is a CLI tool that uses OpenAI models to generate commands for the terminal and file system operations to achieve a goal.

## Installation

```bash
npm install -g auto-copilot-cli
```

### Requirements

- Node.js v18.16.0 or higher - https://nodejs.org/en/download/
- OpenAI API key - https://platform.openai.com/account/api-keys

### Options

- ```-a, --auto-execute``` - Enable auto execute mode (default: false) - Deprecated
- ```-m, --model <modelName>``` - OpenAI model name (default: "gpt-3.5-turbo")
- ```-h, --help``` - display help for command
- ```-V, --version``` - output the version number

### Demo

https://user-images.githubusercontent.com/70219513/236625955-9d4f6b9d-77b8-4515-8a95-423795a1089b.MOV

## Usage example

Rename all files in the current directory to lowercase

```bash
auto-copilot-cli rename all files in the current directory to lowercase
```

Convert all images in the current directory to size 100x100

```bash
auto-copilot-cli convert all images in the current directory to size 100x100
```

Create a file with implementation of binary search

```bash
auto-copilot-cli create js file with implementation of binary search
```

Create a Koa.js project

```bash
auto-copilot-cli create koa.js project should have a route /hello that returns Hello World!
```

Start PostgreSQL in Docker

```bash
auto-copilot-cli start postgresql in docker
```
