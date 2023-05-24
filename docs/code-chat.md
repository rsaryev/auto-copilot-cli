# Chat with AI about code

<p align="center">
  <img src="https://github.com/rsaryev/auto-copilot-cli/assets/70219513/8deb1865-6ec6-4dc8-a631-344627dabb83" width="800" alt="chat">
</p>

## Description

In the chat, you can ask questions about the code.
AI will answer your questions, and if necessary, it will offer code improvements.
This is very convenient when you want to quickly find something in the code, but don't want to waste time searching.
It is also convenient when you want to improve a specific function, you can ask "How can I improve the function {function name}?" and AI will suggest improvements.
Code is analyzed using openai.

## Usage

code-chat works only with files of popular programming languages and additionally with .txt files. All other files will be ignored.

```bash
$ copilot code-chat ./src
```