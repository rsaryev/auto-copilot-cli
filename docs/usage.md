## Usage

<details>
  <summary>Pre-commit</summary>

![pre-commit](https://github.com/rsaryev/auto-copilot-cli/assets/70219513/805175ca-2d23-4468-9e11-8e3e1c1174cb)

```bash
# Analyzes git diff and generates a commit message
$ copilot pre-commit

# Analyzes git diff and generates a commit message with skip confirmation
$ copilot pre-commit -y
```

</details>

<details>
  <summary>Refactor code</summary>

![refactor](https://github.com/rsaryev/auto-copilot-cli/assets/70219513/2c7da6ed-d74a-4aa3-a6d0-33031cc492c0)

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
  <summary>SQL Translator</summary>

![sql-translator](https://github.com/rsaryev/auto-copilot-cli/assets/70219513/aa3c88d0-d747-48be-8406-7dbdab11061e)

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
</details>

<details>
  <summary>Generate test</summary>

![test](https://github.com/rsaryev/auto-copilot-cli/assets/70219513/e405d17f-598c-457e-9827-1f7d8117e2b7)

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

![chat](https://github.com/rsaryev/auto-copilot-cli/assets/70219513/85666309-ab3b-421f-8cbe-7c4efd7f5693)

```bash
# Chat with AI
$ copilot chat "How are you?"

# Chat with AI with prompt
$ copilot chat "How many types in typescript are there?" -p "Software Engineering"
```

</details>

<details>
  <summary>Generate and execute a shell command</summary>

![shell](https://github.com/rsaryev/auto-copilot-cli/assets/70219513/4e2233cf-84ab-49b2-9d7a-1580d8d9cdd1)

```bash
# Convert all mov files to gif
$ copilot shell "convert all mov files to gif"

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

![error](https://github.com/rsaryev/auto-copilot-cli/assets/70219513/d257de69-77ac-4915-a7ef-fe69fae91ee4)


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