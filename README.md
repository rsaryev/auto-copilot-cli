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

## Usage example

Convert all images in the current directory to size 100x100

```bash
auto-copilot-cli convert all images in the current directory to size 100x100
```

Create a file with implementation of binary search

```bash
auto-copilot-cli create js file with implementation of binary search
```

Create a PDF file with top 10 movies

```bash
auto-copilot-cli create pdf file with top 10 movies
```

Create a Koa.js project

```bash
auto-copilot-cli create koa.js project should have a route /hello that returns Hello World!
```

Start PostgreSQL in Docker

```bash
auto-copilot-cli start postgresql in docker
```


### Demo

https://user-images.githubusercontent.com/70219513/236418269-0b82dbb6-4ff9-4eda-992c-c9d6f3e96ad1.mov