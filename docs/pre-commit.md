# Pre-commit

<p align="center">
  <img src="https://github.com/rsaryev/auto-copilot-cli/assets/70219513/805175ca-2d23-4468-9e11-8e3e1c1174cb" width="800" alt="Pre-commit">
</p>

## Description

Analyze git diff and generate a commit message

## Usage

Need to be in a git repository
If you want some files not to be checked, then add to .gitignore
```bash
# Analyzes git diff and generates a commit message
$ copilot pre-commit

# Analyzes git diff and generates a commit message with skip confirmation
$ copilot pre-commit -y
```