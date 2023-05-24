# SQL Translator

<p align="center">
  <img src="https://github.com/rsaryev/auto-copilot-cli/assets/70219513/aa3c88d0-d747-48be-8406-7dbdab11061e" width="800" alt="sql-translator">
</p>

## Description

Translate natural language to SQL

## Usage

```bash
# Translate natural language to SQL
$ copilot sql-translator "get all last posts of users"

# Translate natural language to SQL with output
$ copilot sql-translator "get all last posts of users"

# Translate natural language to SQL with output and sql 
$ copilot sql-translator "get all last posts of users" -s ./schema.sql

# Translate natural language to SQL with output and prisma schema
$ copilot sql-translator "get all last posts of users" -s ./schema.prisma

```